import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import * as fb from "firebase";

import userContext from "../contexts/userContext";
import getSubject from "../subjects";
import getEduLevel from "../educationLevels";

import Cog from "react-icons/lib/fa/cog";
import Check from "react-icons/lib/fa/check-circle";
import Times from "react-icons/lib/fa/times-circle";

class RequestedSession extends Component {
  state = {
    subject: {},
    meetingWith: {},
    level: {}
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

    const eduLevel = await getEduLevel(meetingWith.data().educationID);

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

  render() {
    const startTs = new fb.firestore.Timestamp(this.props.session.start, 0);
    const startDate = startTs.toDate();
    const endTs = new fb.firestore.Timestamp(this.props.session.end, 0);
    const endDate = endTs.toDate();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    return (
      <Box>
        <Menu>{this.state.subject.title}</Menu>
        <p>{this.state.level.title}</p>
        <p>
          {days[startDate.getDay()]}, {months[startDate.getMonth()]}{" "}
          {startDate.getDate()}
        </p>
        <p>
          {startDate.getHours() % 12 == 0 ? 12 : startDate.getHours() % 12}:
          {startDate.getMinutes()} -{" "}
          {endDate.getHours() % 12 == 0 ? 12 : endDate.getHours() % 12}:
          {endDate.getMinutes()}
        </p>
        <Menu>
          <Row>
            <BetterCheck
              color="#09AA82"
              size={30}
              cursor="pointer"
              onClick={() => this.respondToRequest(true)}
            />
            <BetterX
              color="#ff8989"
              size={30}
              cursor="pointer"
              onClick={() => this.respondToRequest(false)}
            />
          </Row>
          <Bar>
            {this.state.meetingWith && (
              <p>
                With {this.state.meetingWith.firstName}{" "}
                {this.state.meetingWith.profilePic && (
                  <Circle src={this.state.meetingWith.profilePic} />
                )}
              </p>
            )}
          </Bar>
        </Menu>
      </Box>
    );
  }
}

const BetterCheck = styled(Check)`
  &:hover {
    transform: scale(1.1);
  }
`;

const BetterX = styled(Times)`
  &:hover {
    transform: scale(1.1);
  }
`;

const Circle = styled.img`
  border-radius: 50%;
  width: 25px;
  height: 25px;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #f6f6f6;
  padding: 15px;
  width: 15%;
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
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

export default RequestedSession;
