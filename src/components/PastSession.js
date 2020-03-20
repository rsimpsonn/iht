import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import * as fb from "firebase";

import userContext from "../contexts/userContext";
import getSubject from "../subjects";

class PastSession extends Component {
  state = {
    subject: "",
    w: {
      firstName: "",
      lastName: ""
    }
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
    this.setState({
      subject: subject,
      w: w.data()
    });
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
        <Menu>{this.state.subject.title}</Menu>
        <p>{this.props.session.status}</p>
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

export default PastSession;
