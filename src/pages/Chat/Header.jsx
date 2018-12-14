import React from 'react';
import {connect} from 'react-redux';

const mapProps = ({userStore, messageStore}) => ({
    currentUser: userStore.currentUser,
    online: messageStore.socketOpen,
});

export default connect(mapProps)(
    ({currentUser, online}) => {
        const status = online ? 'online' : 'offline';
        return (
            <div className="header">
                <span>
                    Logged in as&nbsp;
                    <strong>{currentUser.username}</strong>
                </span>
                <span className="float-right">
                    <span>server&nbsp;
                        <strong className={status}>
                            {status}
                        </strong>
                    </span>
                </span>
            </div>
        )
    }
);
