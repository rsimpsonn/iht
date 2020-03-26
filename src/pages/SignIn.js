import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

import firebase from "../firebase";

import { SmallButton, ButtonText, Tiny, Header } from "../styles";

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.signIn = this.signIn.bind(this);
  }

  state = {
    email: "",
    password: ""
  };

  signIn() {
    firebase.auth
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => this.props.history.push("/dashboard"))
      .catch(error => {
        console.log(error);
        window.alert("wrong username or password");
      });
  }

  handleChange(e) {
    console.log(this.state.email, this.state.password);
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.signIn();
  }

  render() {
    return (
      <Center>
        <Container>
          <Header margin>Sign In</Header>
          <form onSubmit={this.handleSubmit}>
            <Tiny>Email</Tiny>
            <GrayLine>
              <NiceInput
                placeholder="Email"
                name="email"
                onChange={this.handleChange}
              />
            </GrayLine>
            <Tiny>Password</Tiny>
            <GrayLine>
              <NiceInput
                placeholder="Password"
                name="password"
                type="password"
                onChange={this.handleChange}
              />
            </GrayLine>
            <SmallButton type="submit" style={{ marginTop: 30 }}>
              <ButtonText>Sign In</ButtonText>
            </SmallButton>
          </form>
          <Center>
            <Tiny
              onClick={() => this.props.history.push("/signup")}
              style={{ marginTop: 15 }}
              cursor
              margin
            >
              Sign Up
            </Tiny>
            <Tiny
              onClick={() => this.props.history.push("/forgotpassword")}
              cursor
            >
              Forgot Password?
            </Tiny>
          </Center>
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

export default withRouter(SignIn);
