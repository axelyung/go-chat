package chat_db

import (
	"errors"
	"fmt"
	"os"

	utils "github.com/axelyung/go-chat/utils"

	"github.com/globalsign/mgo"
)

// DbCtx is a database context
type DbCtx struct {
	session *mgo.Session
	dbName  string
}

// GetContext returns a new DbCtx
func GetContext() (*DbCtx, error) {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		return nil, errors.New("Env variable DB_HOST not set")
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		return nil, errors.New("Env variable DB_PORT not set")
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		return nil, errors.New("Env variable DB_NAME not set")
	}

	dbURI := fmt.Sprintf("mongodb://%v:%v", dbHost, dbPort)
	session, dailErr := mgo.Dial(dbURI)
	if dailErr != nil {
		return nil, dailErr
	}

	utils.Log.Infof("Connected to %s", dbURI)
	return &DbCtx{
		session: session,
		dbName:  dbName,
	}, nil
}

func (ctx *DbCtx) db() *mgo.Database {
	return ctx.session.Copy().DB(ctx.dbName)
}

// Close closes the DB session
func (ctx *DbCtx) Close() {
	ctx.session.Close()
}
