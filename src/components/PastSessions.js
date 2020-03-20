import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

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

const Header = styled.p`
  font-size: 20px;
  font-family: Lato;
  font-weight: Bold;
`;

const Bar = styled.div`
  display: flex;
  padding: 2%;
  flex-direction: row;
`;

export default PastSessions;
