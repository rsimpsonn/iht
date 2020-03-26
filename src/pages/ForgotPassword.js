import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

import firebase from "../firebase";

import { SmallButton, ButtonText, Tiny, Header, Small } from "../styles";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.sendResetEmail = this.sendResetEmail.bind(this);
  }

  state = {
    resetEmail: "",
    password: ""
  };

  async sendResetEmail(e) {
    e.preventDefault();

    const reset = await firebase.auth.sendPasswordResetEmail(
      this.state.resetEmail
    );

    console.log(reset);

    this.setState({ resetEmailSent: true });
  }

  render() {
    return (
      <Center>
        <Container>
          <Header margin>Forgot Password</Header>
          {!this.state.resetEmailSent && (
            <form onSubmit={this.sendResetEmail}>
              <Small margin>
                Please enter your account email so that we can send you a reset
                link.
              </Small>
              <Tiny>Email</Tiny>
              <GrayLine>
                <NiceInput
                  placeholder="Email"
                  name="resetEmail"
                  onChange={e => this.setState({ resetEmail: e.target.value })}
                />
              </GrayLine>
              <SmallButton type="submit" style={{ marginTop: 30 }}>
                <ButtonText>Reset Password</ButtonText>
              </SmallButton>
            </form>
          )}
          {this.state.resetEmailSent && (
            <Small margin>
              Thank you! Check your email for your reset link.
            </Small>
          )}
        </Container>
      </Center>
    );
  }
}

const GrayLine = styled.div`
  padding: 8px 12px;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3em;
  width: 100%;
  margin: 15px 0;
`;

const NiceInput = styled.input`
  border-width: 0;
  font-family: Lato;
  font-size: 15;
  text-decoration: none;
  width: 100%;

  &:focus {
    outline: none;
  }
`;

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

export default withRouter(ForgotPassword);
