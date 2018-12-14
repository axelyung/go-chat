package chat_server

import (
	"net/http"
	"regexp"
	"time"

	utils "github.com/axelyung/go-chat/utils"
)

var staticFiles = regexp.MustCompile("^/static/")

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if staticFiles.Match([]byte(r.URL.Path)) {
			next.ServeHTTP(w, r)
		} else {
			start := time.Now()
			next.ServeHTTP(w, r)
			utils.Log.Infof("%s %s %s", r.Method, r.URL.Path, time.Since(start).String())
		}
	})
}

func crossOrigin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next.ServeHTTP(w, r)
	})
}

func setJSONHeader(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
}
