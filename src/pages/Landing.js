import React from "react";
import styled from "styled-components";

import WhiteboardScreen from "../components/Whiteboard";

function Landing() {
  return (
    <Main>
      <WhiteboardScreen />
    </Main>
  );
}

const Main = styled.div`
  display: flex;
  flex-direction: row;
`;

export default Landing;
