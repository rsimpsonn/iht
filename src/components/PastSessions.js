import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

import { Header } from "../styles";

import PastSession from "./PastSession";

function PastSessions(props) {
  if (!props.sessions) {
    return <div />;
  }
  return (
    <div>
      {props.sessions.length > 0 && <Header>Past Sessions</Header>}
      <Bar>
        {props.sessions.map(s => (
          <PastSession session={s} />
        ))}
      </Bar>
    </div>
  );
}

const Bar = styled.div`
  display: flex;
  padding: 2%;
  flex-direction: row;
`;

export default PastSessions;
