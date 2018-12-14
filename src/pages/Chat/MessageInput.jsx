import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Row, Col, Input, Button} from 'reactstrap';

import {sendMessage, sendTyping} from 'store/thunks';

export default connect()(
    class MessageInput extends Component {
        state = {
            newMessage: '',
        };

        messageInput = ({ target }) => {
            const { value } = target;
            this.setState({newMessage: value});
            if(value) {
                this.props.dispatch(sendTyping())
            }
        };

        sendMessage = () => {
            const {newMessage} = this.state;
            if (!newMessage) return;
            const {dispatch} = this.props;
            dispatch(sendMessage(newMessage));
            this.setState({newMessage: ''});
        };

        handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        };

        render() {
            const {newMessage} = this.state;
            return (
                <Row>
                    <Col xs={12}>
                        <div className="input-group">
                            <Input
                                value={newMessage}
                                onChange={this.messageInput}
                                placeholder="Write something..."
                                onKeyPress={this.handleKeyPress}
                              />
                            <div className="input-group-append">
                                <Button color="primary" disabled={!newMessage} onClick={this.sendMessage} type="button">
                                    Send
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            );
        }
    }
);
