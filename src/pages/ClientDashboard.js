import React, { Component } from "react";

import { Link } from "react-router-dom";
import styled from "styled-components";

import firebase from "../firebase";

import userContext from "../contexts/userContext";

import UpcomingSessions from "../components/UpcomingSessions";
import ScheduleSessions from "../components/ScheduleSessions";
import PastSessions from "../components/PastSessions";
import RequestedSessions from "../components/RequestedSessions";
//import PastSessions from "../components/PastSessions";

class ClientDashboard extends Component {
  state = { alert: false, sessions: [] };

  static contextType = userContext;

  async componentDidMount() {
    const context = this.context;

    let userType = "client";
    if (context.isTutor) {
      userType = "tutor";
    }

    const clientRef = firebase.db
      .collection(userType + "s")
      .doc(context.user.uid);
    const client = await clientRef.get();
    this.setState({
      client: { id: context.user.uid, ...client.data() }
    });

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
    if (!this.state.client) {
      return <div />;
    }
    return (
      <div>
        {this.state.alert && (
          <AlertBar>
            <AlertText>
              {this.state.alert.message}
              <Link to={this.state.alert.link}>
                {this.state.alert.linkMessage}
              </Link>
            </AlertText>
          </AlertBar>
        )}
        <UpcomingSessions
          sessions={this.state.sessions.filter(s => s.status === "Upcoming")}
        />
        <ScheduleSessions client={this.state.client} />
        <RequestedSessions
          seassions={this.state.sessions.filter(s => s.status === "Requested")}
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

const AlertText = styled.div`
  font-size: 14px;
  color: white;
  font-family: Lato;
`;

const AlertBar = styled.div`
  padding: 2%;
  color: #09aa82;
`;

export default ClientDashboard;
