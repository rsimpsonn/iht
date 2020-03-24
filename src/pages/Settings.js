import React from "react";
import styled from "styled-components";

import TutorSettings from "./TutorSettings";
import ClientSettings from "./ClientSettings";

import userContext from "../contexts/userContext";

function Settings() {
  return (
    <userContext.Consumer>
      {context => (
        <TopMargin>
          {context.isTutor && <TutorSettings uid={context.user.uid} />}
          {!context.isTutor && <ClientSettings uid={context.user.uid} />}
        </TopMargin>
      )}
    </userContext.Consumer>
  );
}

const TopMargin = styled.div`
  margin: 20px 0 0 0;
  padding: 0 2%;
  display: flex;
  justify-content: center;
`;

export default Settings;
