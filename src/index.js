import React from 'react';
import ReactDOM from 'react-dom';
import bsd from 'bootstrap-size-display'
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';



if(process.env.NODE_ENV === 'development'){
    bsd()
}


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
