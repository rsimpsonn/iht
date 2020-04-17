import React, { Component } from "react";

import { Link } from "react-router-dom";
import styled from "styled-components";

import firebase from "../firebase";

import userContext from "../contexts/userContext";
import { Divider } from "semantic-ui-react";

import UpcomingSessions from "../components/UpcomingSessions";
import ScheduleSessions from "../components/ScheduleSessions";
import PastSessions from "../components/PastSessions";
import RequestedSessions from "../components/RequestedSessions";
import CheckCreditCard from "../components/CheckCreditCard";
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

          this.setState({
            sessions: newSessions.sort(
              (a, b) => a.start.toDate().getTime() - b.start.toDate().getTime()
            )
          });
        });
      });
  }

  render() {
    if (!this.state.client) {
      return <div />;
    }

    const upcomingSessions = this.state.sessions.filter(
      s => s.status === "Upcoming"
    );
    const requestedSessions = this.state.sessions.filter(
      s => s.status === "Requested"
    );
    const pastSessions = this.state.sessions.filter(
      s =>
        s.status === "Cancelled fee" ||
        s.status === "Cancelled no fee" ||
        s.status === "Completed" ||
        s.status === "No Show"
    );

    return (
      <div>
        <CheckCreditCard />
        <UpcomingSessions sessions={upcomingSessions} />
        {upcomingSessions.length > 0 && <Divider />}
        <ScheduleSessions client={this.state.client} />
        {requestedSessions.length > 0 && <Divider />}
        <RequestedSessions sessions={requestedSessions} />
        {pastSessions.length > 0 && <Divider />}
        <PastSessions sessions={pastSessions} />
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
