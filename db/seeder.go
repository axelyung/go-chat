package chat_db

import (
	"math/rand"
	"strconv"
	"strings"
	"time"

	utils "github.com/axelyung/go-chat/utils"
	"github.com/icrowley/fake"
)

var (
	usersCount  = 6
	eventsCount = 6
)

func Seed() {
	utils.Log.Info("Running seeds...")
	ctx, err := GetContext()
	utils.CatchPanic(err)
	ctx.session.DB(ctx.dbName).DropDatabase()
	seedUsers(ctx)
	seedEvents(ctx)
	ctx.Close()
}

func seedUsers(dbCtx *DbCtx) {
	var users []interface{}
	for i := 0; i < usersCount; i++ {
		users = append(users, createFakeUser())
	}
	err := dbCtx.session.DB(dbCtx.dbName).C(userCollection).Insert(users...)

	utils.CatchPanic(err)
	utils.Log.Infof("Seeded %d users", len(users))
}

func createFakeUser() User {
	first := fake.FirstName()
	last := fake.LastName()
	username := strings.ToLower(strings.Join([]string{
		first,
		string(last[0]),
		strconv.Itoa(rand.Intn(99) + 1),
	}, ""))
	return User{
		UserName:  username,
		FirstName: first,
		LastName:  last,
	}
}

func seedEvents(dbCtx *DbCtx) {
	users := &[]User{}
	err := dbCtx.session.DB(dbCtx.dbName).C(userCollection).Find(nil).All(users)
	utils.CatchPanic(err)
	var msgs []interface{}
	for _, user := range *users {
		for i := 0; i < eventsCount; i++ {
			msgs = append(msgs, createFakeEvents(user))
		}
	}
	err = dbCtx.session.DB(dbCtx.dbName).C(eventCollection).Insert(msgs...)
	utils.CatchPanic(err)
	utils.Log.Infof("Seeded %d events", len(msgs))
}

func createFakeEvents(user User) ChatEvent {
	return ChatEvent{
		User:      user.ID,
		Timestamp: randomTimestamp(),
		Type:      ChatEventTypes.Message,
		Content:   fake.Sentence(),
	}
}

func randomTimestamp() time.Time {
	randomTime := rand.Int63n(time.Now().Unix()-94608000) + 94608000

	return time.Unix(randomTime, 0)
}
