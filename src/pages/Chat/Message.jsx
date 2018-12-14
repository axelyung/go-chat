import React from "react";
import moment from 'moment'
import { Row, Col } from "reactstrap";

import { eventTypes } from "store/socket";

export default ({ username, type, content, timestamp, sentByCurrentUser }) => {
  const time = moment(timestamp).fromNow()
  
  if (type === eventTypes.MESSAGE) {
    return (
      <Row noGutters>
        <Col
          sm={{ size: 6, offset: sentByCurrentUser ? 6 : 0 }}
          md={{ size: 5, offset: sentByCurrentUser ? 7 : 0 }}
        >
          <div className="message">
            <div className="user">{username}</div>
            <div className="content">{content}</div>
            <div className="timestamp">{time}</div>
          </div>
        </Col>
      </Row>
    );
  }

  if (type === eventTypes.TYPING) {
    return (
      <Row noGutters>
        <Col
          sm={6}
          md={5}
        >
          <div className="message typing">
            <span className="user">{username}</span>
            &nbsp;is typing...
          </div>
        </Col>
      </Row>
    );
  }

  const who = sentByCurrentUser ? "You" : username;
  const action = type === eventTypes.LOGIN
    ? "logged in"
    : "logged out"
  return (
    <div className="status-update">
      <strong>{who}</strong>
      &nbsp;
      {`${action} ${time}`}
    </div>
  )
};
