import React from 'react';
import {connect} from 'react-redux';
import {logout} from 'store/thunks';
import {Button} from 'reactstrap';

const mapState = ({userStore}) => {
    const usersArr = Object.values(userStore.users);
    const online = usersArr.filter((u) => u.online);
    const offline = usersArr.filter((u) => !u.online);
    return {
        online: online.length,
        users: [...online, ...offline],
    };
};

export default connect(mapState)(({users, online, dispatch}) => (
    <div className="users">
        <div>
            <h5 className="mb-3">
                <span>Users ({online} online)</span>
                <Button className="float-right" color="danger" size="sm" onClick={() => dispatch(logout())}>
                    Logout
                </Button>
            </h5>
        </div>
        <div className="users-list">
            {users.map((u) => {
                const className = u.online ? 'user online' : 'user';
                const key = u.id + u.online;
                return (
                    <div key={key} className={className}>
                        {u.username}
                    </div>
                );
            })}
        </div>
    </div>
));
