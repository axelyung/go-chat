# `go-chat`

### A simple chat application with persistence in MongoDB

## Quick Start

```bash
# install js deps
yarn

# build client app
yarn build

# install go deps
dep ensure

# start server and db
yarn docker
```

## Uses

- [Gorilla Mux](https://github.com/gorilla/mux)
- [Gorilla Websocket](https://github.com/gorilla/websocket)
- [Mgo](https://github.com/globalsign/mgo)
- [React](https://github.com/facebook/react)
- [Redux](https://github.com/reduxjs/redux)

## Features

- Real-time message client using WebSockets
- Persistence to MongoDB
- Typing indicator

## Requires

- [yarn](https://yarnpkg.com/en/docs/install)
- [dep](https://github.com/golang/dep)