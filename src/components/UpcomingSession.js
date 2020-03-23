import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import * as fb from "firebase";
import getSubject from "../subjects";

import alertContext from "../contexts/alertContext";

import {
  AiOutlineSetting,
  AiOutlineCalendar,
  AiOutlineClockCircle
} from "react-icons/ai";
import getEduLevel from "../educationLevels";
import { Popup, Divider } from "semantic-ui-react";
import { withRouter } from "react-router-dom";
import { SubHeader, Small, Tiny } from "../styles";

class UpcomingSession extends Component {
  state = {
    subject: "",
    w: {},
    level: "",
    meetingWith: "",
    open: false
  };

  static contextType = alertContext;

  async componentDidMount() {
    const context = this.context;

    const withRef = firebase.db
      .collection(this.props.userContext.isTutor ? "clients" : "tutors")
      .doc(
        this.props.userContext.isTutor
          ? this.props.session.client
          : this.props.session.tutor
      );
    const w = await withRef.get();
    let eduLevel = false;
    if (this.props.userContext.isTutor) {
      eduLevel = await getEduLevel(w.data().educationID);
    }

    const now = new Date();
    const openAt = this.props.session.start.toDate();
    openAt.setMinutes(openAt.getMinutes() - 5);
    const endAt = this.props.session.end.toDate();

    if (now.getTime() < endAt.getTime()) {
      if (now.getTime() >= openAt.getTime()) {
        this.setState({
          open: true
        });

        this.context.setNewAlert({
          until: this.props.session.end.toDate(),
          message: "Your session with " + w.data().firstName + " has started.",
          actionType: "link",
          actionText: "Enter session",
          url: "/sessions?s=" + this.props.session.id,
          banner: true
        });
      } else {
        setTimeout(() => {
          this.setState({ open: true });

          this.context.setNewAlert({
            until: this.props.session.end.toDate(),
            message:
              "Your session with " + w.data().firstName + " is starting soon.",
            actionType: "link",
            actionText: "Enter session",
            url: "/sessions?s=" + this.props.session.id,
            banner: true
          });

          setTimeout(() => {
            this.context.setNewAlert({
              until: this.props.session.end.toDate(),
              message:
                "Your session with " + w.data().firstName + " has started.",
              actionType: "link",
              actionText: "Enter session",
              url: "/sessions?s=" + this.props.session.id,
              banner: true
            });
          }, 300000);
        }, openAt.getTime() - now.getTime());
      }

      setTimeout(
        () => this.setState({ open: false }),
        endAt.getTime() - now.getTime()
      );
    }

    const subject = await getSubject(this.props.session.subjectID);

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

    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    return (
      <Box glow={this.state.open}>
        <Menu>
          <div>
            <SubHeader>{this.state.subject.title}</SubHeader>
            <Small>With {this.state.w.firstName}</Small>
          </div>
          <Bar>
            {this.state.w.profilePic && (
              <Circle src={this.state.w.profilePic} />
            )}
            <Popup
              trigger={<AiOutlineSetting color="#5a5a5a" size={14} />}
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
        {this.state.open && (
          <EnterSession
            onClick={() =>
              this.props.history.push("/sessions?s=" + this.props.session.id)
            }
          >
            <EnterSessionText>Enter Session</EnterSessionText>
          </EnterSession>
        )}
      </Box>
    );
  }
}

const Circle = styled.img`
  border-radius: 50%;
  width: 30px;
  height: 30px;
  margin: 0 10px;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  margin: 0 15px;
  padding: 15px;
  width: 17.5%;

  ${props =>
    props.glow &&
    `
    box-shadow: 0 0 20px #CBF2E9;
    `}
`;

const Cancel = styled.p`
  &:hover {
    transform: scale(1.1);
  }
`;

const EnterSession = styled.div`
  background-color: #09aa82;
  border-radius: 20px;
  padding: 10px;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const EnterSessionText = styled.p`
  font-family: Lato;
  font-weight: Bold;
  color: white;
  font-size: 15px;
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

export default withRouter(UpcomingSession);
