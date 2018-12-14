package chat_db

import (
	"time"

	utils "github.com/axelyung/go-chat/utils"
	"github.com/globalsign/mgo/bson"
)

var eventCollection = "events"

type ChatEvent struct {
	ID        bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Type      string        `json:"type"`
	User      bson.ObjectId `json:"user"`
	Content   string        `json:"content"`
	Timestamp time.Time     `json:"timestamp"`
}

var ChatEventTypes = struct {
	Auth    string
	Login   string
	Logout  string
	Message string
	Typing  string
}{"auth", "login", "logout", "message", "typing"}

func (ctx *DbCtx) GetEvents(count int, skip int) ([]ChatEvent, error) {
	if count < 1 {
		count = 10
	}

	db := ctx.db()
	defer db.Session.Close()

	result := &[]ChatEvent{}
	err := db.C(eventCollection).
		Find(nil).
		Sort("-timestamp").
		Skip(skip).
		Limit(count).
		All(result)
	if err != nil {
		return nil, err
	}

	return *result, nil
}

func CreateEvent(eventType string, userId string, content string) ChatEvent {
	return ChatEvent{
		ID:        bson.NewObjectId(),
		Type:      eventType,
		User:      bson.ObjectIdHex(userId),
		Content:   content,
		Timestamp: time.Now(),
	}
}

func (ctx *DbCtx) SaveEvent(event ChatEvent) (ChatEvent, error) {
	db := ctx.db()
	defer db.Session.Close()

	utils.Log.Infof("Saving %s event", event.Type)
	err := db.C(eventCollection).Insert(event)
	return event, err
}
