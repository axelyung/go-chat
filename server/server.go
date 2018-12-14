package chat_server

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	db "github.com/axelyung/go-chat/db"
	utils "github.com/axelyung/go-chat/utils"
)

// Server accepts http and ws requests
type Server struct {
	dbCtx   *db.DbCtx
	address string
	hub     *Hub
}

// Start starts the http server on the given port
func Start() {
	dbCtx, err := db.GetContext()
	utils.CatchPanic(err)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	srv := Server{
		dbCtx:   dbCtx,
		address: ":" + port,
		hub:     newHub(dbCtx),
	}
	defer srv.dbCtx.Close()
	go srv.hub.run()

	err = srv.listen()
	utils.CatchPanic(err)
}

func (srv Server) listen() error {
	c := make(chan error)
	go func() {
		c <- http.ListenAndServe(srv.address, srv.router())
	}()
	utils.Log.Infof("Running in %s mode", os.Getenv("ENV"))
	utils.Log.Infof("Listenting at %s", srv.address)
	return <-c
}

func (srv Server) router() http.Handler {
	router := mux.NewRouter()

	router.Use(logMiddleware)
	router.Use(crossOrigin)

	router.HandleFunc("/ping", srv.pingHandler).Methods("GET")
	router.HandleFunc("/messages", srv.getMessagesHandler).Methods("GET")
	router.HandleFunc("/users", srv.getUsersHandler).Methods("GET")
	router.HandleFunc("/chat", srv.handleChat)

	// for static files
	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./build/")))

	return router
}

func (srv Server) indexHandler(w http.ResponseWriter, r *http.Request) {

}

func (srv Server) pingHandler(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "pong")
}

func (srv Server) getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	var (
		err   error
		count int
		skip  int
		query struct {
			count string
			skip  string
		}
	)
	q := r.URL.Query()
	query.count = q.Get("count")
	query.skip = q.Get("skip")

	if query.count == "" {
		count = 10
	} else {
		count, err = strconv.Atoi(query.count)
		if utils.HandleErr(w, err) {
			return
		}
	}

	if query.skip == "" {
		skip = 0
	} else {
		skip, err = strconv.Atoi(query.skip)
		if utils.HandleErr(w, err) {
			return
		}
	}

	messages, err := srv.dbCtx.GetEvents(count, skip)
	if utils.HandleErr(w, err) {
		return
	}

	setJSONHeader(w)
	err = json.NewEncoder(w).Encode(messages)
	if utils.HandleErr(w, err) {
		return
	}
}

type userDTO struct {
	ID       string `json:"id"`
	UserName string `json:"username"`
	Online   bool   `json:"online"`
}

func (srv Server) getUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := srv.dbCtx.GetUsers()
	if utils.HandleErr(w, err) {
		return
	}

	res := map[string]userDTO{}
	for _, user := range users {
		id := user.ID.Hex()
		srv.hub.clients.RLock()
		_, online := srv.hub.clients.online[id]
		srv.hub.clients.RUnlock()

		res[id] = userDTO{
			id,
			user.UserName,
			online,
		}
	}

	err = json.NewEncoder(w).Encode(res)
	if utils.HandleErr(w, err) {
		return
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (srv *Server) handleChat(w http.ResponseWriter, req *http.Request) {
	username := strings.ToLower(req.URL.Query().Get("username"))
	if username == "" {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Username must be in parameters on websocket handshake.")
	}

	user, err := srv.dbCtx.GetUser(username)
	if err != nil {
		utils.Log.Infof("User does not exist. Creating user \"%s\"", username)
		user, err = srv.dbCtx.CreateAndSaveUser(username)
		if utils.HandleErr(w, err) {
			return
		}
	}

	userID := user.ID.Hex()

	if os.Getenv("ENV") == "development" {
		// allow cross origin requests in development
		upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	}

	conn, err := upgrader.Upgrade(w, req, nil)
	if utils.HandleErr(w, err) {
		return
	}

	client := &Client{userID, srv.hub, conn, make(chan ClientEvent, 256)}
	srv.hub.register(client, user)
	go client.writePump()
	go client.readPump()
}
