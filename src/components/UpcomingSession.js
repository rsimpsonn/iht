import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import * as fb from "firebase";
import getSubject from "../subjects";

import userContext from "../contexts/userContext";
import { AiOutlineSetting } from "react-icons/ai";
import getEduLevel from "../educationLevels";
import { Popup } from "semantic-ui-react";

class UpcomingSession extends Component {
  state = {
    subject: "",
    w: {
      firstName: ""
    },
    level: "",
    meetingWith: ""
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
    const w = await withRef.get();
    let eduLevel = false;

    if (context.isTutor) {
      eduLevel = await getEduLevel(w.data().educationID);
    }

    this.setState({
      subject: subject,
      w: w.data(),
      level: eduLevel
    });
  }

  respondToCancel(time) {
    const docRef = firebase.db
      .collection("sessions")
      .doc(this.props.session.id);

    const fee = time - Date.now();

    if (fee <= 86400000) {
      docRef.set(
        {
          status: "Cancelled fee"
        },
        { merge: true }
      );
    } else if (fee > 86400000) {
      docRef.set(
        {
          status: "Cancelled no fee"
        },
        { merge: true }
      );
    }
  }

  confirmCancel(time) {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      this.respondToCancel(time);
    }
  }

  render() {
    const startDate = this.props.session.start.toDate();
    const endDate = this.props.session.end.toDate();

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
        <Menu>
          {this.state.subject.title}
          <Bar>
            <Popup
              trigger={<AiOutlineSetting color="#D8D8D8" size="20px" />}
              position="bottom center"
              flowing
              hoverable
              onClick={() => this.confirmCancel(startDate.getTime())}
            >
              <p>
                <Cancel>Cancel</Cancel>
              </p>
            </Popup>
          </Bar>
        </Menu>
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
        {this.state.w && (
          <p>
            With {this.state.w.firstName}{" "}
            {this.state.w.profilePic && (
              <Circle src={this.state.w.profilePic} />
            )}
          </p>
        )}
      </Box>
    );
  }
}

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

const Cancel = styled.p`
  &:hover {
    transform: scale(1.1);
  }
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

export default UpcomingSession;
