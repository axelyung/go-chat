import {createStore, compose, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import endpoints from './endpoints';

import userStore from './user';
import messageStore from './message';

const reducer = combineReducers(({
    userStore: userStore.reducer,
    messageStore: messageStore.reducer,
}));

const initState = {
    userStore: userStore.initState,
    messageStore: messageStore.initState,
};

// add redux devtool
const devToolExtension =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const thunkMiddleware = applyMiddleware(thunk.withExtraArgument({endpoints}))

// use redux-logger middleware if devtool extension is missing
const enhancer = devToolExtension
    ? compose(thunkMiddleware, devToolExtension)
    : thunkMiddleware;

const store = createStore(reducer, initState, enhancer);

export default store;