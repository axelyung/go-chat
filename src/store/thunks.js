import _ from 'lodash/fp';
import endpoints from './endpoints';
import {initSocket, sendToSocket, closeSocket, eventTypes} from './socket';
import messageStore from './message';
import userStore from './user';

const unique = (arr) => _.uniqBy((item) => item.id, arr);

const sortMessages = (messages) =>
    messages.sort((a, b) => {
        const timeA = new Date(a.timestamp);
        const timeB = new Date(b.timestamp);
        return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
    });

export const getMessages = (count, skip) => async (dispatch, getState) => {
    const {messages} = getState().messageStore;
    const newMessages = await endpoints.getMessages(count, skip);
    const allMessages = sortMessages(unique([...messages, ...newMessages]));
    dispatch(messageStore.actionCreators.updateMessages(allMessages));
};

export const checkForUser = (userId) => async (dispatch, getState) => {
    const {users} = getState().userStore;
    const userExists = users[userId];
    if (!userExists) {
        await dispatch(getUsers());
    }
};

export const getUsers = () => async (dispatch) => {
    const users = await endpoints.getUsers();
    dispatch(userStore.actionCreators.updateUsers(users));
};

export const login = (username) => (dispatch) => {
    if (!username) {
        throw new Error('username required');
    }
    return dispatch(initSocket(username));
};

export const logout = () => (dispatch) => {
    dispatch(userStore.actionCreators.unsetCurrentUser());
    closeSocket();
};

let blockTypingBroadcast = false;
export const sendTyping = () => (dispatch, getState) => {
    if (!blockTypingBroadcast) {
        sendToSocket(
            JSON.stringify({
                type: eventTypes.TYPING,
                user: getState().userStore.currentUser.id,
            })
        );

        blockTypingBroadcast = true;
        setTimeout(() => {
            blockTypingBroadcast = false;
        }, 2000);
    }
};

let stopTypingTimeout = 0;
export const receiveTyping = (user) => (dispatch, getState) => {
    if (stopTypingTimeout) {
        clearTimeout(stopTypingTimeout);
    }
    if (!getState().messageStore.typing.includes(user)) {
        dispatch(messageStore.actionCreators.userStartedTyping(user))
    }

    stopTypingTimeout = setTimeout(() => {
        dispatch(messageStore.actionCreators.userStoppedTyping(user))
        stopTypingTimeout = 0;
    }, 3000);
};

export const sendMessage = (content) => async (dispatch, getState) => {
    if (!content) return;
    const newMessage = {
        // TODO: randomly assign key for reacts mapping
        tempId: Math.random()
            .toString(36)
            .substring(7),
        type: eventTypes.MESSAGE,
        content,
    };
    sendToSocket(JSON.stringify(newMessage));
};