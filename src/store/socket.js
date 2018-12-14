import userStore from './user';
import messageStore from './message';
import {checkForUser, receiveTyping} from './thunks';

export const eventTypes = {
    AUTH: 'auth',
    LOGIN: 'login',
    LOGOUT: 'logout',
    MESSAGE: 'message',
    TYPING: 'typing',
};

let socket;
let retryInterval = 0;

const retryConnection = () => (dispatch, getState) => {
    const { username } = getState().userStore.currentUser;
    if (!username) {
        dispatch(userStore.actionCreators.unsetCurrentUser());
        return;
    }
    if(retryInterval) return;

    initSocket(username);
    retryInterval = setInterval(async () => {
        if(getState().messageStore.socketOpen) {
            clearInterval(retryInterval);
            retryInterval = 0;
        } else {
            console.info('Retrying connection')
            dispatch(initSocket(username))
        }
    }, 3000);
};

export const initSocket = (username) => (dispatch, getState) =>
    new Promise((resolve) => {
        if (!window.WebSocket) {
            throw new Error('This browser does not support websockets');
        }

        const host = process.env.NODE_ENV === 'development'
            ? 'localhost:3000'
            : document.location.host;
        const url = `ws://${host}/chat?username=${username}`;
        socket = new WebSocket(url);

        window.addEventListener('close', () => {
            socket.close();
        });

        socket.addEventListener('close', () => {
            dispatch({type: messageStore.actionTypes.socketClosed});
            const { loggedIn } = getState().userStore
            if(loggedIn && !retryInterval) {
                console.error('Connection closed unexpectedly.')
                dispatch(retryConnection());
            } else {
                console.log('Connection closed.')
            }
        });

        socket.addEventListener('error', () => {
            resolve(false);
        });

        socket.addEventListener('open', () => {
            dispatch({type: messageStore.actionTypes.socketReady});
            resolve(true);
        });

        socket.addEventListener('message', ({data}) => {
            const chatEvent = JSON.parse(data);
            dispatch(logEvent(chatEvent));
            if (chatEvent.user) {
                dispatch(checkForUser(chatEvent.user));
            }
            switch (chatEvent.type) {
                case eventTypes.AUTH:
                    const user = JSON.parse(chatEvent.content);
                    dispatch(userStore.actionCreators.setCurrentUser(user));
                    break;
                case eventTypes.LOGIN:
                    dispatch(addMessage(chatEvent));
                    dispatch(userStore.actionCreators.userLoggedIn(chatEvent.user));
                    break;
                case eventTypes.LOGOUT:
                    dispatch(addMessage(chatEvent));
                    dispatch(userStore.actionCreators.userLoggedOut(chatEvent.user));
                    break;
                case eventTypes.MESSAGE:
                    dispatch(addMessage(chatEvent));
                    dispatch(messageStore.actionCreators.userStoppedTyping(chatEvent.user))
                    break;
                case eventTypes.TYPING:
                    dispatch(receiveTyping(chatEvent.user));
                    break;
            }
        });
    });

const addMessage = (chatEvent) => (dispatch, getState) => {
    const {messages} = getState().messageStore;
    dispatch(messageStore.actionCreators.updateMessages([...messages, chatEvent]));
};

const logEvent = (chatEvent) => (dispatch, getState) => {
    const {users} = getState().userStore;
    const {username} = users[chatEvent.user] || {};
    switch (chatEvent.type) {
        case eventTypes.AUTH:
            console.groupCollapsed(`Authenticated as ${username || chatEvent.user}`);
            break;
        case eventTypes.MESSAGE:
            console.groupCollapsed(`${username} wrote "${chatEvent.content}"`);
            break;
        case eventTypes.LOGIN:
            console.groupCollapsed(`${username} logged in`);
            break;
        case eventTypes.LOGOUT:
            console.groupCollapsed(`${username} logged off`);
            break;
        default:
            return;
    }
    console.log(JSON.stringify(chatEvent, null, 4));
    console.groupEnd();
};

export const closeSocket = () => {
    if (!socket) return;
    socket.close();
};

export const sendToSocket = (msg) => {
    if (!socket) {
        throw new Error('Socket not initialized!');
    }
    socket.send(msg);
};
