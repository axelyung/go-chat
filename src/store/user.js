import _ from 'lodash/fp';

const initState = {
    loggedIn: false,
    currentUser: {},
    users: {},
};

const actionTypes = {
    addUsers: 'ADD_USERS',
    userLoggedIn: 'USER_LOGGED_IN',
    userLoggedOut: 'USER_LOGGED_OUT',
    setCurrentUser: 'SET_CURRENT_USER',
    unsetCurrentUser: 'UNSET_CURRENT_USER',
};

const actionCreators = {
    userLoggedIn: (userId) => ({
        type: actionTypes.userLoggedIn,
        payload: {userId},
    }),
    userLoggedOut: (userId) => ({
        type: actionTypes.userLoggedOut,
        payload: {userId},
    }),
    updateUsers: (users) => ({
        type: actionTypes.addUsers,
        payload: {users},
    }),
    setCurrentUser: (user) => ({
        type: actionTypes.setCurrentUser,
        payload: {user},
    }),
    unsetCurrentUser: () => ({
        type: actionTypes.unsetCurrentUser,
    }),
};

const reducer = (state = initState, {type, payload}) => {
    switch (type) {
        case actionTypes.addUsers:
            const {users} = payload;
            return {...state, users};
        case actionTypes.setCurrentUser:
            const {user: currentUser} = payload;
            return {...state, loggedIn: true, currentUser};
        case actionTypes.unsetCurrentUser:
            return {...state, loggedIn: false, currentUser: {}};
        case actionTypes.userLoggedIn:
            return state.users[payload.userId]
                ? _.set(['users', payload.userId, 'online'], true)(state)
                : state;
        case actionTypes.userLoggedOut:
            return state.users[payload.userId]
                ? _.set(['users', payload.userId, 'online'], false)(state)
                : state;
        default:
            return state;
    }
};

export default {actionTypes, actionCreators, initState, reducer};
