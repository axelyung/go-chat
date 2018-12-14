package chat_db

import "github.com/globalsign/mgo/bson"

var userCollection = "users"

type User struct {
	ID        bson.ObjectId `bson:"_id,omitempty" json:"id"`
	UserName  string        `json:"username"`
	FirstName string        `json:"firstName"`
	LastName  string        `json:"lastName"`
}

func (ctx *DbCtx) GetUsers() ([]User, error) {
	db := ctx.db()
	defer db.Session.Close()

	result := &[]User{}

	err := db.C(userCollection).
		Find(nil).
		Sort("username").
		All(result)
	if err != nil {
		return nil, err
	}

	return *result, nil
}

func (ctx *DbCtx) CreateAndSaveUser(username string) (User, error) {
	db := ctx.db()
	defer db.Session.Close()
	user := User{
		UserName: username,
	}
	err := db.C(userCollection).Insert(user)
	if err != nil {
		return user, err
	}
	return ctx.GetUser(username)
}

func (ctx *DbCtx) GetUser(username string) (User, error) {
	db := ctx.db()
	defer db.Session.Close()

	result := &User{}

	err := db.C(userCollection).
		Find(bson.M{"username": username}).
		One(result)

	return *result, err
}
