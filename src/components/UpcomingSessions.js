import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

import { Header } from "../styles";

import UpcomingSession from "./UpcomingSession";

function UpcomingSessions(props) {
  if (!props.sessions || props.sessions.length === 0) {
    return <div />;
  }

  return (
    <userContext.Consumer>
      {userContext => (
        <TopMargin>
          <Header>Upcoming Sessions</Header>
          <Bar>
            {props.sessions.map(s => (
              <UpcomingSession userContext={userContext} session={s} />
            ))}
          </Bar>
        </TopMargin>
      )}
    </userContext.Consumer>
  );
}

const Bar = styled.div`
  width: 100%;
  padding: 2%;
  display: flex;
  flex-direction: row;
  overflow-x: scroll;
`;

const TopMargin = styled.div`
  padding: 20px 0 20px;
`;

export default UpcomingSessions;
