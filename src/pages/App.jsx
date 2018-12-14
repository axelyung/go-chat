import React from 'react';
import {connect} from 'react-redux';
import {HashRouter, Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import {getMessages, getUsers} from 'store/thunks';

import Login from './Login';
import Chat from './Chat';

export default connect()(
    class App extends React.Component {
        componentDidMount() {
            const {dispatch} = this.props;
            dispatch(getMessages(20));
            dispatch(getUsers());
        }

        render() {
            return (
                <Container className="app">
                    <HashRouter>
                        <Switch>
                            <Route path="/login" component={Login} />
                            <Route path="/chat" component={Chat} />
                            <Redirect exact path="/" to="/login" />
                            <Route path="*" render={() => '404'} />
                        </Switch>
                    </HashRouter>
                </Container>
            );
        }
    }
);
