package main

import "github.com/tkanos/gonfig"

var config Configuration

type Configuration struct {
	set                bool
	Port               int
	dbConnectionString string
	dbName             string
}

func getConfig() (Configuration, error) {
	if config.set {
		return config, nil
	}
	config := Configuration{}
	err := gonfig.GetConf("../../config.json", &config)
	config.set = true
	return config, err
}
