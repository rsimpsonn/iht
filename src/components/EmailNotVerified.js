import React from "react";
import styled from "styled-components";

import { SmallButton, ButtonText, Header, Small } from "../styles";
import userContext from "../contexts/userContext";

function EmailNotVerified() {
  return (
    <userContext.Consumer>
      {context => (
        <Center>
          <Container>
            <Header margin>Email Not Yet Verified</Header>
            <Small margin>
              You have not yet verified your email. Please check your email for
              a verification link.
            </Small>
            <br />
            <SmallButton onClick={() => context.user.sendEmailVerification()}>
              <ButtonText>Resend Email</ButtonText>
            </SmallButton>
          </Container>
        </Center>
      )}
    </userContext.Consumer>
  );
}

const Container = styled.div`
  width: 25%;
  margin: 10% 0;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default EmailNotVerified;
