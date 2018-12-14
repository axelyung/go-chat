package main

import (
	"flag"

	db "github.com/axelyung/go-chat/db"
	server "github.com/axelyung/go-chat/server"
	utils "github.com/axelyung/go-chat/utils"
	"github.com/joho/godotenv"
)

func main() {
	seed := flag.Bool("seed", false, "Seed the database for local development")
	flag.Parse()

	err := godotenv.Load()
	utils.CatchPanic(err)

	if *seed {
		db.Seed()
	} else {
		server.Start()
	}
}
