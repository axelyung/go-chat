import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom'
import {Button} from 'reactstrap';
import {logout} from 'store/thunks'

export default connect()(withRouter(({dispatch, history}) => (
    <div className="logout">
        <Button 
            onClick={() => {
                dispatch(logout())
                history.push("/login")
            }}
        color="danger">Logout</Button>
    </div>
)));
