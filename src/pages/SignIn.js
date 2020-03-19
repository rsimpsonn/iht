import React, { Component } from "react";
import styled from "styled-components";
import firebase from "../firebase";

class SignIn extends Component {

  state = {
    email: "",
    password: ""
  }

  signIn(email, password) {
    console.log(email, password);
    firebase.auth.signInWithEmailAndPassword(email, password)
    .catch((error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <div>
          <input name="email" onChange={(e) => this.setState({email: e.target.value})} />
          <input name="password" type="password" onChange={(e) => this.setState({password: e.target.value})} />
          <div onClick={() => this.signIn(this.state.email, this.state.password)}>Submit</div>
      </div>
    )
  }
}

export default SignIn;
