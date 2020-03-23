import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import * as fb from "firebase";

import userContext from "../contexts/userContext";
import getSubject from "../subjects";
import getEduLevel from "../educationLevels";
import { Popup, Divider } from "semantic-ui-react";
import { SubHeader, Small, Tiny } from "../styles";

import {
  AiFillCheckCircle,
  AiFillCloseCircle,
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineClockCircle,
  AiOutlineSetting
} from "react-icons/ai";

class RequestedSession extends Component {
  state = {
    subject: "",
    meetingWith: {},
    level: ""
  };

  static contextType = userContext;

  async componentDidMount() {
    const subject = await getSubject(this.props.session.subjectID);

    const context = this.context;
    const withRef = firebase.db
      .collection(context.isTutor ? "clients" : "tutors")
      .doc(
        context.isTutor ? this.props.session.client : this.props.session.tutor
      );
    const meetingWith = await withRef.get();

    let eduLevel = false;
    if (context.isTutor) {
      eduLevel = await getEduLevel(meetingWith.data().educationID);
    }

    this.setState({
      subject: subject,
      meetingWith: meetingWith.data(),
      level: eduLevel
    });
  }

  respondToRequest(accepted) {
    const docRef = firebase.db
      .collection("sessions")
      .doc(this.props.session.id);

    if (accepted) {
      docRef.set(
        {
          status: "Upcoming"
        },
        { merge: true }
      );
    } else {
      docRef.set(
        {
          status: "Declined"
        },
        { merge: true }
      );
    }
  }

  confirmAccept() {
    if (window.confirm("Are you sure you want to accept this session?")) {
      this.respondToRequest(true);
    }
  }

  confirmDecline() {
    if (window.confirm("Are you sure you want to decline this session?")) {
      this.respondToRequest(false);
    }
  }

  confirmCancel(time) {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      this.respondToRequest(false);
    }
  }

  render() {
    const startDate = this.props.session.start.toDate();
    const endDate = this.props.session.end.toDate();

    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

    if (this.context.isTutor) {
      return (
        <Box>
          <Menu>
            <div>
              <SubHeader>{this.state.subject.title}</SubHeader>
              <Small>{this.state.level.title}</Small>
            </div>
            <Row>
              <BetterCheck
                color="#09AA82"
                size={30}
                cursor="pointer"
                onClick={() => this.confirmAccept()}
              />
              <BetterX
                color="#ff8989"
                size={30}
                cursor="pointer"
                onClick={() => this.confirmDecline()}
              />
            </Row>
          </Menu>
          <Divider />
          <Tiny margin>
            <AiOutlineCalendar size={14} /> {days[startDate.getDay()]}{" "}
            {startDate.getMonth() + 1}/{startDate.getDate()}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <AiOutlineClockCircle size={14} />{" "}
            {startDate.getHours() % 12 == 0 ? 12 : startDate.getHours() % 12}
            {startDate.getHours() > 11 ? "PM" : "AM"} -{" "}
            {endDate.getHours() % 12 == 0 ? 12 : endDate.getHours() % 12}
            {endDate.getHours() > 11 ? "PM" : "AM"}
          </Tiny>
          {this.state.meetingWith && (
            <Tiny>
              <AiOutlineUser size={14} /> With{" "}
              {this.state.meetingWith.firstName}{" "}
              {this.state.meetingWith.profilePic && (
                <Circle src={this.state.meetingWith.profilePic} />
              )}
            </Tiny>
          )}
        </Box>
      );
    } else {
      return (
        <Box>
          <Menu>
            <div>
              <SubHeader>{this.state.subject.title}</SubHeader>
              <Small>With {this.state.meetingWith.firstName}</Small>
            </div>
            <Row>
              <Circle src={this.state.meetingWith.profilePic} />
            </Row>
          </Menu>
          <Divider />
          <Tiny margin>
            <AiOutlineCalendar size={14} /> {days[startDate.getDay()]}{" "}
            {startDate.getMonth() + 1}/{startDate.getDate()}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <AiOutlineClockCircle size={14} />{" "}
            {startDate.getHours() % 12 == 0 ? 12 : startDate.getHours() % 12}
            {startDate.getHours() > 11 ? "PM" : "AM"} -{" "}
            {endDate.getHours() % 12 == 0 ? 12 : endDate.getHours() % 12}
            {endDate.getHours() > 11 ? "PM" : "AM"}
          </Tiny>
          <Popup
            trigger={<AiOutlineSetting color="#5a5a5a" size={14} />}
            position="bottom center"
            flowing
            hoverable
            onClick={() => this.confirmCancel()}
          >
            <Bar>
              <Cancel>Cancel</Cancel>
            </Bar>
          </Popup>
        </Box>
      );
    }
  }
}

const BetterCheck = styled(AiFillCheckCircle)`
  &:hover {
    transform: scale(1.1);
  }
`;

const BetterX = styled(AiFillCloseCircle)`
  &:hover {
    transform: scale(1.1);
  }
`;

const Circle = styled.img`
  border-radius: 50%;
  width: 30px;
  height: 30px;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  margin: 0 15px;
  padding: 15px;
  width: 17.5%;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Cancel = styled.p`
  &:hover {
    transform: scale(1.1);
  }
`;

export default RequestedSession;
