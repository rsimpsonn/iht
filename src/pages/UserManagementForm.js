import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

import firebase from "../firebase";

import userContext from "../contexts/userContext";

import { SmallButton, ButtonText, Tiny, Header, Small } from "../styles";

class UserManagementForm extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  state = {
    action: ""
  };

  static contextType = userContext;

  async componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);

    const action = params.get("mode");
    const code = params.get("oobCode");

    if (action === "verifyEmail") {
      const res = await firebase.auth.applyActionCode(code);
      this.context.user.reload();
      this.props.history.push("/dashboard");
    }

    this.setState({ action, code });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  async resetPassword(e) {
    e.preventDefault();

    if (this.state.password && this.state.confirm) {
      if (this.state.password !== this.state.confirm) {
        alert("Your passwords do not match");
      } else {
        const changed = await firebase.auth.confirmPasswordReset(
          this.state.code,
          this.state.password
        );
        this.props.history.push("/signin");
      }
    } else {
      alert("Please enter values for both fields");
    }
  }

  render() {
    switch (this.state.action) {
      case "resetPassword":
        return (
          <Center>
            <Container>
              <Header margin>Forgot Password</Header>
              <form onSubmit={this.resetPassword}>
                <Tiny>Password</Tiny>
                <GrayLine>
                  <NiceInput
                    placeholder="Password"
                    type="password"
                    name="password"
                    onChange={this.handleChange}
                  />
                </GrayLine>
                <Tiny>Confirm Password</Tiny>
                <GrayLine>
                  <NiceInput
                    placeholder="Confirm Password"
                    type="password"
                    name="confirm"
                    onChange={this.handleChange}
                  />
                </GrayLine>
                <SmallButton type="submit" style={{ marginTop: 30 }}>
                  <ButtonText>Reset Password</ButtonText>
                </SmallButton>
              </form>
            </Container>
          </Center>
        );
      default:
        return <div />;
    }
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

export default withRouter(UserManagementForm);
