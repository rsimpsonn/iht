import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Divider } from "semantic-ui-react";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

import Checklist from "../components/Checklist";
import UpcomingSessions from "../components/UpcomingSessions";
import RequestedSessions from "../components/RequestedSessions";
import PastSessions from "../components/PastSessions";
import ConfirmAvailability from "../components/ConfirmAvailability";

class TutorDashboard extends Component {
  state = { alert: false, sessions: [] };

  static contextType = userContext;

  async componentDidMount() {
    const context = this.context;

    let userType = "client";
    if (context.isTutor) {
      userType = "tutor";
    }

    firebase.db
      .collection("sessions")
      .where(userType, "==", context.user.uid)
      .onSnapshot(snapshot =>
        this.setState({
          sessions: snapshot.docs.map(s => {
            return {
              id: s.id,
              ...s.data()
            };
          })
        })
      );
  }

  render() {
    const upcomingSessions = this.state.sessions.filter(
      s => s.status === "Upcoming"
    );
    const requestedSessions = this.state.sessions.filter(
      s => s.status === "Requested"
    );

    return (
      <div>
        <ConfirmAvailability />
        <Checklist />
        <UpcomingSessions sessions={upcomingSessions} />
        {upcomingSessions.length > 0 && <Divider />}
        <RequestedSessions sessions={requestedSessions} />
        {requestedSessions.length > 0 && <Divider />}
        <PastSessions
          sessions={this.state.sessions.filter(
            s =>
              s.status === "Cancelled fee" ||
              s.status === "Cancelled no fee" ||
              s.status === "Completed" ||
              s.status === "No Show"
          )}
        />
      </div>
    );
  }
}

export default TutorDashboard;
