import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Row, Col, Input, Button } from "reactstrap";
import { sendMessage } from "./store";
import Message from "./Message";

const mapState = state => ({
  messages: state.messages,
  newMessage: state.newMessage
});
const mapDispatch = dispatch => ({
  sendMessage: content => dispatch(sendMessage(content))
});

class Chat extends Component {
  state = {
    newMessage: ""
  };

  messageInput = e => {
    this.setState({ newMessage: e.target.value });
  };

  sendMessage = () => {
    const { newMessage } = this.state;
    this.props.sendMessage(newMessage);
    this.setState({ newMessage: "" });
  };

  render() {
    const { messages } = this.props;
    const { newMessage } = this.state;
    return (
      <Container>
        <div className="chat">
          {messages.map(m => (
            <Message {...m} />
          ))}
        </div>
        <Row>
          <Col xs={12}>
            <Input
              value={newMessage}
              onChange={this.messageInput}
              placeholder="Write something..."
            />
            <Button disabled={!newMessage} onClick={this.sendMessage} type="button">
              Send
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default connect(
  mapState,
  mapDispatch
)(Chat);
