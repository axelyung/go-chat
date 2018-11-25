import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";

const initState = {
  currentUserId: 0,
  users: [],
  messages: [
    {
      user: 1,
      content:
        "Pariatur fugiat nisi tempor aliqua enim ea nulla commodo commodo dolore sint velit."
    },
    {
      user: 2,
      content:
        "Esse pariatur est laboris in non ullamco deserunt anim sit quis enim officia velit laboris."
    }
  ]
};

const types = {
  newMessageUpdate: "NEW_MESSAGE_UPDATE",
  sendMessagePending: "SEND_MESSAGE_PENDING",
  sendMessageSuceeded: "SEND_MESSAGE_PENDING",
  sendMessageFailed: "SEND_MESSAGE_FAILED",
  newMessage: "NEW_MESSAGE"
};

export const sendMessage = content => (dispatch, getState) => {
  if (!content) return;
  const user = getState().currentUserId;
  dispatch(createNewMessageAction({ user, content }));
};

export const createNewMessageAction = message => ({
  type: types.newMessage,
  payload: { message }
});

const reducer = (state = initState, { type, payload }) => {
  switch (type) {
    case types.newMessageUpdate:
      return { ...state, newMessage: payload.message };
    case types.newMessage:
      const updatedMessages = [...state.messages, payload.message];
      return {
        ...state,
        messages: updatedMessages
      };
    default:
      return state;
  }
};

// add redux devtool
const devToolExtension =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

// use redux-logger middleware if devtool extension is missing
const enhancer = devToolExtension
  ? compose(
      applyMiddleware(thunk),
      devToolExtension
    )
  : applyMiddleware(thunk);

export default createStore(reducer, initState, applyMiddleware(thunk));
