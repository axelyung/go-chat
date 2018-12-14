package chat_utils

import (
	"io"
	"net/http"
)

func CatchPrint(err error) bool {
	if err != nil {
		Log.Error(err.Error())
		return true
	}
	return false
}

func CatchPanic(err error) {
	if err != nil {
		panic(err.Error())
	}
}

func HandleErr(w http.ResponseWriter, err error) bool {
	if err != nil {
		Log.Error(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, err.Error())
		return true
	}
	return false
}
