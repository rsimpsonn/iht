import React, { Component } from "react";
import styled from "styled-components";
import { Dropdown, Divider, Loader } from "semantic-ui-react";
import CreditCard from "../components/CreditCard";

import {
  Header,
  SubHeader,
  Small,
  ButtonText,
  SmallButton,
  NiceInput,
  NiceArea
} from "../styles";

import getEduLevel, { getAllEducationLevels } from "../educationLevels";
import firebase from "../firebase";
import axios from "axios";

import userDetailsContext from "../contexts/userDetailsContext";

class ClientSettings extends Component {
  constructor(props) {
    super(props);

    this.getAllEducationLevels = this.getAllEducationLevels.bind(this);
    this.getEduLevel = this.getEduLevel.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  state = {};

  static contextType = userDetailsContext;

  async getAllEducationLevels() {
    const allEducationLevels = await getAllEducationLevels();

    this.setState({
      allEducationLevels
    });
  }

  async getEduLevel() {
    const eduLevel = await getEduLevel(
      this.context.userDetails.educationID.toString()
    );

    this.setState({
      eduLevel
    });
  }

  async updateProfile() {
    let changedDetails = {
      firstName: this.state.firstName,
      lastName: this.state.lastName
    };

    if (this.state.educationID) {
      changedDetails.educationID = this.state.educationID;
    }

    firebase.db
      .collection("clients")
      .doc(this.props.uid)
      .set(changedDetails, { merge: true });

    const userDetailsRef = firebase.db
      .collection("clients")
      .doc(this.props.uid);

    const userDetailsDoc = await userDetailsRef.get();
    const userDetails = userDetailsDoc.data();

    this.context.setUserDetails(userDetails);

    this.setState({
      editingProfile: false,
      eduLevel: false
    });
  }

  render() {
    if (!this.context.userDetails.firstName) {
      return <Loader active={true}>Loading</Loader>;
    }

    if (this.context.userDetails && !this.state.allEducationLevels) {
      this.getAllEducationLevels();
    }

    if (this.context.userDetails && !this.state.eduLevel) {
      this.getEduLevel();
    }

    const educationLevels = this.state.allEducationLevels
      ? this.state.allEducationLevels.map(s => {
          return {
            key: s.id,
            value: s.id,
            text: s.title
          };
        })
      : [];

    console.log(this.state.highPref);
    return (
      <Row style={{ margin: "0 auto" }}>
        <Main>
          <Card>
            <Header margin>User Profile</Header>
            {this.context.userDetails ? (
              <Row>
                <div style={{ margin: 10 }}>
                  <Row>
                    <div style={{ width: 120 }}>
                      <Small>First Name</Small>
                      {!this.state.editingProfile && (
                        <SubHeader>
                          {this.context.userDetails.firstName}
                        </SubHeader>
                      )}
                      {this.state.editingProfile && (
                        <NiceInput
                          placeholder="First Name"
                          value={this.state.firstName}
                          onChange={e =>
                            this.setState({ firstName: e.target.value })
                          }
                        />
                      )}
                    </div>
                    <div>
                      <Small>Last Name</Small>
                      {!this.state.editingProfile && (
                        <SubHeader>
                          {this.context.userDetails.lastName}
                        </SubHeader>
                      )}
                      {this.state.editingProfile && (
                        <NiceInput
                          placeholder={"Last Name"}
                          value={this.state.lastName}
                          onChange={e =>
                            this.setState({ lastName: e.target.value })
                          }
                        />
                      )}
                    </div>
                  </Row>
                  <div>
                    <Small>
                      {this.context.userDetails.parent ? "Child's " : ""}{" "}
                      Education Level
                    </Small>
                    {!this.state.editingProfile && (
                      <SubHeader>
                        {this.state.eduLevel ? this.state.eduLevel.title : ""}
                      </SubHeader>
                    )}
                    {this.state.editingProfile && (
                      <Dropdown
                        placeholder={
                          this.state.eduLevel ? this.state.eduLevel.title : ""
                        }
                        options={educationLevels}
                        loading={!this.state.allEducationLevels}
                        defaultValue={this.state.eduLevel.id}
                        onChange={(e, data) =>
                          this.setState({ educationID: data.value })
                        }
                      />
                    )}
                  </div>
                </div>
              </Row>
            ) : (
              ""
            )}
            <Divider />
            {this.state.editingProfile && (
              <SmallButton color="#585EE6" onClick={this.updateProfile}>
                <ButtonText>Save Changes</ButtonText>
              </SmallButton>
            )}
            {!this.state.editingProfile && (
              <SmallButton
                onClick={() =>
                  this.setState({
                    editingProfile: !this.state.editingProfile,
                    firstName: this.context.userDetails.firstName,
                    lastName: this.context.userDetails.lastName
                  })
                }
                color={this.state.editingProfile ? "#585EE6" : false}
              >
                <ButtonText>Edit Profile</ButtonText>
              </SmallButton>
            )}
          </Card>
        </Main>
        <Card>
          <Header margin>Credit Card Information</Header>
          <CreditCard />
        </Card>
      </Row>
    );
  }
}

const Circle = styled.div`
  border-radius: 50%;
  width: 75px;
  height: 75px;
  background-color: #09aa82;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;

  ${props =>
    props.image &&
    `
      background-image: url(${props.image})`}
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Card = styled.div`
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 0 20px #e9e9e9;
  margin: 20px;
  width: 400px;
`;

const Main = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export default ClientSettings;
