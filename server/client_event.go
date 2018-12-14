package chat_server

import (
	"encoding/json"
	"time"

	db "github.com/axelyung/go-chat/db"
)

// ClientEvent represents a message from a client
type ClientEvent struct {
	Type      string    `json:"type"`
	User      string    `json:"user"`
	ID        string    `json:"id"`
	TempID    string    `json:"tempId"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}

// ChatEvent converts a ClientEvent into
// a chat_db.ChatEvent to save
func (event *ClientEvent) ChatEvent() db.ChatEvent {
	return db.CreateEvent(event.Type, event.User, event.Content)
}

// JSON converts the ClientEvent into
// a JSON string
func (event *ClientEvent) JSON() ([]byte, error) {
	return json.Marshal(event)
}

func (event *ClientEvent) String() string {
	str, err := json.Marshal(event)
	if err != nil {
		return ""
	}
	return string(str)
}
