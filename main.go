package main

import (
	"flag"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/justinas/alice"
)

func main() {
	seed := flag.Bool("seed", false, "Seed the database for local development")
	if *seed {
	}
	serve()
}

func serve() {
	c, err := getConfig()
	catch(err)

	router := getRouter()
	chain := alice.New(logHandler).Then(router)

	address := "localhost:" + strconv.Itoa(c.Port)
	log.Println("Listenting at " + address)
	err = http.ListenAndServe(address, chain)
	catch(err)
}

func getRouter() *mux.Router {
	router := mux.NewRouter()
	router.HandleFunc("/ping", pingHandler)
	return router
}

func pingHandler(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "pong")
}

func logHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		h.ServeHTTP(w, r)
		log.Printf("%s request @ %s %v", r.Method, r.URL.Path, time.Since(start))
	})
}
