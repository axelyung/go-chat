import React from 'react';
import {Row, Col} from 'reactstrap';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

import {getMessages, getUsers} from 'store/thunks';

import Header from './Header';
import Messages from './Messages';
import MessageInput from './MessageInput';
import Users from './Users';

const mapState = ({userStore}) => ({
    loggedIn: userStore.loggedIn,
});

export default connect(mapState)(
    class Chat extends React.Component {
        componentDidMount() {
            const {dispatch} = this.props;
            dispatch(getMessages(20));
            dispatch(getUsers());
        }
        render() {
            return !this.props.loggedIn ? (
                <Redirect to="/login" />
            ) : (
                <React.Fragment>
                    <Row>
                        <Col md={3}>
                            <Users />
                        </Col>
                        <Col md={9}>
                            <Header />
                            <div className="chat">
                                <Messages />
                                <MessageInput />
                            </div>
                        </Col>
                    </Row>
                </React.Fragment>
            );
        }
    }
);
