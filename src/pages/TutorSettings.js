import React, { Component } from "react";
import styled from "styled-components";
import { Dropdown, Divider } from "semantic-ui-react";

import "../customfileinputs.css";

import {
  Header,
  SubHeader,
  Small,
  ButtonText,
  SmallButton,
  NiceInput,
  NiceArea
} from "../styles";

import { getAllSubjects } from "../subjects";
import getMajor, { getAllMajors } from "../majors";
import getUniversity from "../universities";
import firebase from "../firebase";

import userDetailsContext from "../contexts/userDetailsContext";

class TutorSettings extends Component {
  constructor(props) {
    super(props);

    this.getCollege = this.getCollege.bind(this);
    this.getMajor = this.getMajor.bind(this);
    this.getAllSubjects = this.getAllSubjects.bind(this);
    this.newPreferences = this.newPreferences.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.storeProfilePic = this.storeProfilePic.bind(this);
  }

  state = {};

  static contextType = userDetailsContext;

  async getCollege() {
    const college = await getUniversity(this.context.userDetails.universityID);

    this.setState({ college });
  }

  async getMajor() {
    const major = await getMajor(this.context.userDetails.majorID);

    this.setState({ major });
  }

  async getAllMajors() {
    const allMajors = await getAllMajors();

    this.setState({
      allMajors
    });
  }

  async getAllSubjects() {
    const allSubjects = await getAllSubjects();

    this.setState({
      allSubjects
    });
  }

  newPreferences() {
    return (
      this.state.elementaryPref || this.state.middlePref || this.state.highPref
    );
  }

  async updatePreferences() {
    let changedDetails = {};

    if (this.state.elementaryPref) {
      changedDetails.elementaryPref = this.state.elementaryPref;
    }

    if (this.state.middlePref) {
      changedDetails.middlePref = this.state.middlePref;
    }

    if (this.state.highPref) {
      changedDetails.highPref = this.state.highPref;
    }

    firebase.db
      .collection("tutors")
      .doc(this.props.uid)
      .set(changedDetails, { merge: true });

    const userDetailsRef = firebase.db.collection("tutors").doc(this.props.uid);

    const userDetailsDoc = await userDetailsRef.get();
    const userDetails = userDetailsDoc.data();

    this.context.setUserDetails({ userDetails });

    let changedFields = ["elementaryPref", "middlePref", "highPref"];
    changedFields.forEach(f => {
      if (this.state[f]) {
        this.setState({
          [f]: false
        });
      }
    });
  }

  async storeProfilePic() {
    const storageRef = firebase.storage.ref();

    const mainImage = storageRef.child(this.state.profilePicFile.name);

    const data = await mainImage.put(this.state.profilePicFile);

    const url = await mainImage.getDownloadURL();

    return url;
  }

  async updateProfile() {
    if (!this.state.lastName || !this.state.firstName) {
      alert("You cannot have an empty first or last name");
      return;
    }
    let changedDetails = {
      firstName: this.state.firstName,
      lastName: this.state.lastName
    };

    if (this.state.bio) {
      changedDetails.bio = this.state.bio;
    }

    if (this.state.profilePicFile) {
      const url = await this.storeProfilePic();

      changedDetails.profilePic = url;
    }

    firebase.db
      .collection("tutors")
      .doc(this.props.uid)
      .set(changedDetails, { merge: true });

    const userDetailsRef = firebase.db.collection("tutors").doc(this.props.uid);

    const userDetailsDoc = await userDetailsRef.get();
    const userDetails = userDetailsDoc.data();

    this.context.setUserDetails({ userDetails });

    this.setState({
      editingProfile: false
    });
  }

  render() {
    if (this.context.userDetails && !this.state.college) {
      this.getCollege();
    }

    if (this.context.userDetails && !this.state.major) {
      this.getMajor();
    }

    if (this.context.userDetails && !this.state.allSubjects) {
      this.getAllSubjects();
    }

    const elementaryOptions = this.state.allSubjects
      ? this.state.allSubjects
          .filter(s => s.level === "0")
          .map(s => {
            return {
              key: s.id,
              value: s.id,
              text: s.title
            };
          })
      : [];

    const middleOptions = this.state.allSubjects
      ? this.state.allSubjects
          .filter(s => s.level === "1")
          .map(s => {
            return {
              key: s.id,
              value: s.id,
              text: s.title
            };
          })
      : [];

    const highOptions = this.state.allSubjects
      ? this.state.allSubjects
          .filter(s => s.level === "2")
          .map(s => {
            return {
              key: s.id,
              value: s.id,
              text: s.title
            };
          })
      : [];

    console.log(this.state.profilePicFile);
    return (
      <Row style={{ margin: "0 auto" }}>
        <Main>
          <Card>
            <Header margin>User Profile</Header>
            {this.context.userDetails ? (
              <Row>
                {(!this.state.editingProfile ||
                  this.context.userDetails.profilePic) && (
                  <Circle image={this.context.userDetails.profilePic} />
                )}
                {this.state.editingProfile &&
                  !this.context.userDetails.profilePic && (
                    <Circle
                      image={
                        this.state.profilePicFile
                          ? URL.createObjectURL(this.state.profilePicFile)
                          : this.context.userDetails.profilePic
                      }
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id="file"
                        onChange={e =>
                          this.setState({ profilePicFile: e.target.files[0] })
                        }
                      />
                      <label for="file">+</label>
                    </Circle>
                  )}
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
                          onChange={firstName => this.setState({ firstName })}
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
                          onChange={lastName => this.setState({ lastName })}
                        />
                      )}
                    </div>
                  </Row>
                  <Small>Bio</Small>
                  {!this.state.editingProfile && (
                    <SubHeader>{this.context.userDetails.bio}</SubHeader>
                  )}
                  {this.state.editingProfile && (
                    <NiceArea
                      placeholder="Short bio"
                      value={this.state.bio}
                      onChange={bio => this.setState({ bio: bio.target.value })}
                    />
                  )}
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
                    bio: this.context.userDetails.bio,
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
          <Card>
            <Header margin>Education</Header>
            {this.context.userDetails ? (
              <Row>
                <div style={{ margin: 10 }}>
                  <Row>
                    <div style={{ margin: "0 40px 0 0" }}>
                      <Small>University</Small>
                      <SubHeader>
                        {this.state.college ? this.state.college.title : ""}
                      </SubHeader>
                    </div>
                    <div>
                      <Small>Year</Small>
                      <SubHeader>{this.context.userDetails.year}</SubHeader>
                    </div>
                  </Row>
                  <Small>Major</Small>
                  <SubHeader>
                    {this.state.major ? this.state.major.title : ""}
                  </SubHeader>
                </div>
              </Row>
            ) : (
              ""
            )}
            <Divider />
            <SmallButton
              onClick={() =>
                this.setState({
                  editingEducation: !this.state.editingEducation
                })
              }
              color={this.state.editingEducation ? "#585EE6" : false}
            >
              <ButtonText>
                {this.state.editingEducation
                  ? "Update Education"
                  : "Edit Education"}
              </ButtonText>
            </SmallButton>
          </Card>
        </Main>
        <Card>
          <Header margin>Subject Preferences</Header>
          {this.context.userDetails ? (
            <div>
              <Small margin>Elementary school preferences</Small>
              <Dropdown
                text={"Elementary level"}
                fluid
                multiple
                selection
                scrolling
                options={elementaryOptions}
                loading={!this.state.allSubjects}
                defaultValue={this.context.userDetails.elementaryPref}
                onChange={(e, { value }) =>
                  this.setState({ elementaryPref: value })
                }
              />
              <Small margin>Middle school preferences</Small>
              <Dropdown
                text={"Middle school level"}
                fluid
                multiple
                selection
                scrolling
                options={middleOptions}
                loading={!this.state.allSubjects}
                defaultValue={this.context.userDetails.middlePref}
                onChange={(e, { value }) =>
                  this.setState({ middlePref: value })
                }
              />
              <Small margin>High school preferences</Small>
              <Dropdown
                text={"High school level"}
                fluid
                multiple
                scrolling
                selection
                options={highOptions}
                loading={!this.state.allSubjects}
                onChange={(e, { value }) => this.setState({ highPref: value })}
                defaultValue={this.context.userDetails.highPref}
              />
              <Divider />
              {this.newPreferences() && (
                <SmallButton>
                  <ButtonText onClick={this.updatePreferences}>
                    Save Changes
                  </ButtonText>
                </SmallButton>
              )}
              {!this.newPreferences() && <Small>All preferences saved</Small>}
            </div>
          ) : (
            ""
          )}
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

  background-position: center;
  background-repeat: "no-repeat";

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

export default TutorSettings;
