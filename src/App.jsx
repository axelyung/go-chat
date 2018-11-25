import React, { Component } from "react";
import { Provider } from "react-redux";
import store from "./store";
import Chat from "./Chat";

export const currentUserId = 0;

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Chat/>
        </div>
      </Provider>
    );
  }
}
