import React, {Component} from 'react';
import {connect} from 'react-redux';

import Message from './Message';
import { eventTypes } from '../../store/socket';

const mapState = ({userStore, messageStore}) => ({
    messages: messageStore.messages,
    users: userStore.users,
    currentUserId: userStore.currentUser.id,
    typing: messageStore.typing,
});

export default connect(mapState)(
    class Chat extends Component {
        constructor(props) {
            super(props);
            this.messagesEnd = React.createRef();
        }

        componentDidMount() {
            this.scrollToBottom();
        }

        componentDidUpdate() {
            this.scrollToBottom();
        }

        scrollToBottom() {
            this.messagesEnd.scrollIntoView({behavior: 'smooth'});
        }

        render() {
            const {messages, users, currentUserId, typing} = this.props;
            return (
                <div className="messages">
                    {messages.map((m) => {
                        const {user, id} = m;
                        const username = (users[user] || {}).username;
                        return (
                            <Message key={id} username={username} sentByCurrentUser={user === currentUserId} {...m} />
                        );
                    })}
                    {typing.filter(user => user !== currentUserId).map(user => {
                        const username = (users[user] || {}).username;
                        return (
                            <Message key={user} username={username} type={eventTypes.TYPING} />
                        )
                    })
                        
                    }
                    <div
                        ref={(el) => {
                            this.messagesEnd = el;
                        }}/>
                </div>
            );
        }
    }
);
