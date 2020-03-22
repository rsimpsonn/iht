import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

import UpcomingSessions from "../components/UpcomingSessions";
import RequestedSessions from "../components/RequestedSessions";
import PastSessions from "../components/PastSessions";

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
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          let newSessions = this.state.sessions;
          if (change.type === "added") {
            newSessions.push({ id: change.doc.id, ...change.doc.data() });
          }

          if (change.type === "modified") {
            const updatedSession = change.doc.data();
            let oldSession = newSessions.findIndex(s => s.id === change.doc.id);
            newSessions[oldSession] = {
              id: change.doc.id,
              ...updatedSession
            };
          }

          console.log(this.state.sessions === newSessions);
          this.setState({
            sessions: newSessions
          });
        });
      });
  }

  render() {
    return (
      <div>
        <UpcomingSessions
          sessions={this.state.sessions.filter(s => s.status === "Upcoming")}
        />
        <RequestedSessions
          sessions={this.state.sessions.filter(s => s.status === "Requested")}
        />
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
