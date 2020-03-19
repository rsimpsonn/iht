import React from "react";
import styled from "styled-components";

import FirebaseAuthContext from "../contexts/userContext";

function Landing() {

  const { authStatusReported, isUserSignedIn } = FirebaseAuthContext;

  return (
    <Main>
      <p>{authStatusReported}</p>
      <p>{isUserSignedIn}</p>
    </Main>
  )
}

const Main = styled.div`
  display: flex;
  flex-direction: row;
`;

export default Landing;
