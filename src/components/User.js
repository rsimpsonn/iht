import React, { Component } from "react";
import firebase from "../firebase";

import styled from "styled-components";

import userDetailsContext from "../contexts/userDetailsContext";

class User extends Component {
  static contextType = userDetailsContext;

  state = {
    userDetails: {}
  };

  async componentDidMount() {
    const userRef = firebase.db
      .collection(this.props.isTutor ? "tutors" : "clients")
      .doc(this.props.id);
    const userDoc = await userRef.get();

    this.context.setUserDetails({ userDetails: userDoc.data() });

    this.setState({
      userDetails: userDoc.data()
    });
  }

  render() {
    const { ...rest } = this.props;

    const profilePic = this.state.userDetails.profilePic
      ? this.state.userDetails.profilePic
      : false;
    const firstLetter = this.state.userDetails.firstName
      ? this.state.userDetails.firstName.charAt(0)
      : "";
    return (
      <Circle {...rest} image={profilePic}>
        {!profilePic && <SubHeader>{firstLetter}</SubHeader>}
      </Circle>
    );
  }
}

const Circle = styled.div`
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background-color: #09aa82;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props =>
    props.image &&
    `
      background-image: url(${props.image})`}
`;

const SubHeader = styled.p`
  font-family: Lato;
  font-weight: Bold;
  color: white;
  font-size: 15px;
`;

export default User;
