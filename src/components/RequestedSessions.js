import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

import RequestedSession from "./RequestedSession";

import { Header } from "../styles";

function RequestedSessions(props) {
  if (!props.sessions || props.sessions.length === 0) {
    return <div />;
  }
  return (
    <TopMargin>
      <Header>Requested Sessions</Header>
      <Bar>
        {props.sessions.map(s => (
          <RequestedSession session={s} />
        ))}
      </Bar>
    </TopMargin>
  );
}

const Bar = styled.div`
  display: flex;
  padding: 2%;
  flex-direction: row;
`;

const TopMargin = styled.div`
  padding: 20px 0 20px;
`;

export default RequestedSessions;
