import _ from 'lodash/fp';

const initState = {
    socketOpen: false,
    messages: [],
    typing: [],
};

const actionTypes = {
    newMessage: 'NEW_MESSAGE',
    addMessages: 'ADD_MESSAGES',
    socketReady: 'SOCKET_READY',
    socketClosed: 'SOCKET_CLOSED',
    userStartedTyping: 'USER_STARTED_TYPING',
    userStoppedTyping: 'USER_STOPPED_TYPING',
};

const actionCreators = {
    newMessage: (message) => ({
        type: actionTypes.newMessage,
        payload: {message},
    }),
    updateMessages: (messages) => ({
        type: actionTypes.addMessages,
        payload: {messages},
    }),
    userStartedTyping: (user) => ({
        type: actionTypes.userStartedTyping,
        payload: {user}
    }),
    userStoppedTyping: (user) => ({
        type: actionTypes.userStoppedTyping,
        payload: {user}
    })
};

const reducer = (state = initState, {type, payload}) => {
    switch (type) {
        case actionTypes.newMessage:
            const updatedMessages = [...state.messages, payload.message];
            return {...state, messages: updatedMessages};
        case actionTypes.addMessages:
            const {messages} = payload;
            return {...state, messages};
        case actionTypes.socketReady:
            return {...state, socketOpen: true};
        case actionTypes.socketClosed:
            return {...state, socketOpen: false};
        case actionTypes.userStartedTyping:
            return {
                ...state, 
                typing: _.uniq([...state.typing, payload.user].sort()),
            };
        case actionTypes.userStoppedTyping:
            return {
                ...state, 
                typing: state.typing.filter(id => id !== payload.user),
            };
        default:
            return state;
    }
};

export default {actionTypes, actionCreators, initState, reducer};
