import React from "react";
import { connect } from 'react-redux'
import { Row, Col } from "reactstrap";

const Message = ({ content, user, currentUserId }) => {
    const sentByUser = user === currentUserId;
  return (
    <Row>
      <Col md={{ size: 5, offset: sentByUser ? 7 : 0 }}>
        <div className="message">
          <div className="user">User {user}</div>
          <div className="content">{content}</div>
        </div>
      </Col>
    </Row>
  );
};

export default connect(({ currentUserId }) => ({ currentUserId}))(Message)
