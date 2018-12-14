package chat_server

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/globalsign/mgo/bson"

	db "github.com/axelyung/go-chat/db"
	utils "github.com/axelyung/go-chat/utils"
)

// Hub maintains the set of active clients
// and broadcasts events as they arrive
type Hub struct {
	// Registered clients.
	clients struct {
		sync.RWMutex
		internal map[*Client]string
		online   map[string]bool
	}
	// Inbound messages from the clients.
	broadcast chan ClientEvent

	dbCtx *db.DbCtx
}

func newHub(dbCtx *db.DbCtx) *Hub {
	hub := &Hub{
		broadcast: make(chan ClientEvent),
		dbCtx:     dbCtx,
	}
	hub.clients.internal = map[*Client]string{}
	hub.clients.online = map[string]bool{}
	return hub
}

func (h *Hub) run() {
	for {
		event := <-h.broadcast
		go func(e ClientEvent) {
			record, err := h.save(e.ChatEvent())
			if utils.CatchPrint(err) {
				return
			}

			event.ID = record.ID.Hex()
			event.Timestamp = record.Timestamp

			logEvent(event)

			h.clients.Lock()
			defer h.clients.Unlock()
			for client := range h.clients.internal {
				// The hub handles messages by looping over
				// the registered clients and sending the
				// event to the client's send channel
				select {
				case client.send <- event:
				default:
					// If the client's send buffer is full, then the hub assumes
					// that the client is dead or stuck. In this case, the hub
					// unregisters the client and closes the websocket.
					h.unregister(client)
				}
			}
		}(event)
	}
}

func (h *Hub) save(event db.ChatEvent) (db.ChatEvent, error) {
	var err error
	switch event.Type {
	case db.ChatEventTypes.Login,
		db.ChatEventTypes.Logout,
		db.ChatEventTypes.Message:
		event, err = h.dbCtx.SaveEvent(event)
		break
	default:
		event.Timestamp = time.Now()
		event.ID = bson.NewObjectId()
	}
	return event, err
}

func (h *Hub) register(client *Client, user db.User) {
	id := user.ID.Hex()
	h.clients.Lock()
	h.clients.internal[client] = id
	h.clients.online[id] = true
	h.clients.Unlock()

	content, err := json.Marshal(user)
	if utils.CatchPrint(err) {
		return
	}

	client.writeMessage(ClientEvent{
		User:      client.user,
		Type:      db.ChatEventTypes.Auth,
		Timestamp: time.Now(),
		Content:   string(content),
	})

	h.broadcast <- ClientEvent{
		User: client.user,
		Type: db.ChatEventTypes.Login,
	}
}

func (h *Hub) unregister(client *Client) {
	h.clients.Lock()
	defer h.clients.Unlock()
	if id, ok := h.clients.internal[client]; ok {
		delete(h.clients.internal, client)
		delete(h.clients.online, id)
		close(client.send)
		h.broadcast <- ClientEvent{
			User: client.user,
			Type: db.ChatEventTypes.Logout,
		}
	}
}

func logEvent(event ClientEvent) {
	switch event.Type {
	case db.ChatEventTypes.Auth:
		utils.Log.Infof("User %s authenticating", event.User)
	case db.ChatEventTypes.Message:
		utils.Log.Infof("User %s sent message \"%s\"", event.User, event.Content)
	case db.ChatEventTypes.Login:
		utils.Log.Infof("User %s logged on", event.User)
	case db.ChatEventTypes.Logout:
		utils.Log.Infof("User %s logged out", event.User)
	case db.ChatEventTypes.Typing:
		utils.Log.Infof("User %s is typing", event.User)
	}
}
