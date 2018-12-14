package chat_server

import (
	"encoding/json"
	"log"
	"time"

	db "github.com/axelyung/go-chat/db"
	utils "github.com/axelyung/go-chat/utils"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	// users id
	user string

	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan ClientEvent
}

func (c *Client) logoff() {
	c.hub.unregister(c)
	c.conn.Close()
}

// ChatMessage represents a message from a client
type ChatMessage struct {
	TempID  string `json:"tempId"`
	Content string `json:"content"`
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer c.logoff()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		event := &ClientEvent{
			User: c.user,
			Type: db.ChatEventTypes.Message,
		}
		err = json.Unmarshal(message, event)
		if utils.CatchPrint(err) {
			return
		}

		c.hub.broadcast <- *event
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.logoff()
	}()
	for {
		select {
		case event, ok := <-c.send:

			c.conn.SetWriteDeadline(time.Now().Add(writeWait))

			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.writeMessage(event)

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) writeMessage(event ClientEvent) {
	w, err := c.conn.NextWriter(websocket.TextMessage)
	if utils.CatchPrint(err) {
		return
	}

	serializedEvent, _ := event.JSON()

	w.Write(serializedEvent)

	// Add queued chat messages to the current websocket message.
	n := len(c.send)
	for i := 0; i < n; i++ {
		b, err := json.Marshal(<-c.send)
		if utils.CatchPrint(err) {
			continue
		}
		w.Write(b)
	}

	if err := w.Close(); err != nil {
		return
	}
}
