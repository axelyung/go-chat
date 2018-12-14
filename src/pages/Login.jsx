import React from 'react';
import {Input, Button} from 'reactstrap';
import {connect} from 'react-redux';
import {login} from 'store/thunks';
import {Redirect} from 'react-router-dom';

const mapState = ({userStore}) => ({
    loggedIn: userStore.loggedIn,
});

export default connect(mapState)(
    class Login extends React.Component {
        state = {
            username: '',
            error: '',
            loading: false,
        };

        usernameInput = (e) => {
            this.setState({
                username: e.target.value,
                error: '',
            });
        };

        login = async () => {
            const {username} = this.state;
            if (!username) return;
            const {dispatch} = this.props;

            this.setState({loading: true});
            const success = await dispatch(login(username));
            if (!success) {
                this.setState({
                    loading: false,
                    error: `User "${username}" does not exist`,
                });
            }
        };

        render() {
            const {username, error, loading} = this.state;
            return this.props.loggedIn ? (
                <Redirect to="/chat" />
            ) : (
                <div className="login">
                    <h3>Login</h3>
                    <p>Enter a username. If you've logged in before your messages will reappear, if not a new user will be created for you.</p>
                    <Input
                        className="mb-2"
                        placeholder="Username"
                        value={username}
                        onChange={this.usernameInput}/>
                    <Button color="primary" onClick={this.login} disabled={!username}>
                        {loading ? 'Loading...' : 'Login'}
                    </Button>
                    {error}
                </div>
            );
        }
    }
);
