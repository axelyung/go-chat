package main

import "github.com/globalsign/mgo"

type DbConnection struct {
	session *mgo.Session
	db      *mgo.Database
}

func initDbConnection() DbConnection {
	c, err := getConfig()
	catch(err)
	session, _ := mgo.Dial(c.dbConnectionString)
	db := session.DB(c.dbName)
	return DbConnection{session, db}
}

func (connection DbConnection) Users() *mgo.Collection {
	return connection.db.C("users")
}
