import React from 'react';
import ReactDOM from 'react-dom';
import bsd from 'bootstrap-size-display';
import './index.scss';
import {Provider} from 'react-redux';
import App from './pages/App';
import store from './store';

if (process.env.NODE_ENV === 'development') {
    bsd();
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
