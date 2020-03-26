import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

import firebase from "../firebase";

import { Checkbox, Divider, Dropdown } from "semantic-ui-react";

import { SmallButton, ButtonText, Tiny, Header } from "../styles";

class ClientSignUp extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.signIn = this.signIn.bind(this);
  }

  state = {
    primary: "parent",
    studentReceivesNotifications: true,
    parentReceivesNotifications: true
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
    console.log(e.target.name, e.target.value);
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (
      this.state.studentFirstName &&
      this.state.studentLastName &&
      this.state.parentFirstName &&
      this.state.parentLastName &&
      this.state.parentEmail &&
      this.state.grade &&
      this.state.selectedSubjects &&
      this.state.selectedSchedule &&
      this.state.password &&
      this.state.confirm
    ) {
      if (this.state.password !== this.state.confirm) {
        alert("Please enter matching passwords");
        return;
      }

      let educationID = Math.floor(this.state.grade / 5);
      if (this.state.grade === 9) {
        educationID += 1;
      }

      if (this.state.grade === 5) {
        educationID -= 1;
      }

      let user = {
        firstName: this.state.studentFirstName,
        lastName: this.state.studentLastName,
        grade: this.state.grade,
        educationID: educationID,
        parent: {
          firstName: this.state.parentFirstName,
          lastName: this.state.parentLastName
        },
        emailNotifications: [],
        answers: {
          subject: this.state.selectedSubjects,
          schedule: this.state.selectedSchedule
        }
      };

      if (this.state.parentReceivesNotifications) {
        user.emailNotifications.push(this.state.parentEmail);
      }

      let primaryEmail = this.state.parentEmail;
      if (this.state.studentEmail) {
        if (this.state.primary === "student") {
          primaryEmail = this.state.studentEmail;
          user.parent.email = this.state.parentEmail;
        } else {
          user.studentEmail = this.state.studentEmail;
        }

        if (this.state.studentReceivesNotifications) {
          user.emailNotifications.push(this.state.studentEmail);
        }
      }

      const signedUp = await firebase.auth.createUserWithEmailAndPassword(
        primaryEmail,
        this.state.password
      );

      if (signedUp.user !== null) {
        signedUp.user.sendEmailVerification();

        firebase.db
          .collection("users")
          .doc(signedUp.user.uid)
          .set({ isTutor: false });

        firebase.db
          .collection("clients")
          .doc(signedUp.user.uid)
          .set(user);

        this.props.history.push("/dashboard");
      } else {
        alert("There was a problem with the sign up process.");
      }
    }

    alert("There are fields missing");
  }

  render() {
    const scheduleOptions = [
      {
        text: "Less than once per month",
        value: 1,
        key: 1
      },
      {
        text: "1 - 2 times per month",
        value: 2,
        key: 2
      },
      {
        text: "1 - 2 times per week",
        value: 3,
        key: 3
      },
      {
        text: "Daily",
        value: 4,
        key: 4
      }
    ];

    const subjectOptions = [
      {
        text: "STEM (Science, Technology, Engineering, Mathematics)",
        value: 1,
        key: 1
      },
      {
        text: "Reading and Writing",
        value: 2,
        key: 2
      },
      {
        text: "Test Prep (ACT, SAT, SAT Subject Tests, ISEE)",
        value: 3,
        key: 3
      }
    ];

    const gradeOptions = [12, 11, 10, 9, 8, 7, 6].map(g => {
      return {
        text: g,
        value: g,
        key: g
      };
    });

    return (
      <Center>
        <Container>
          <Header margin>Sign Up</Header>
          <form onSubmit={this.handleSubmit}>
            <Tiny>
              Student Name{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <Row>
              <GrayLine style={{ width: "60%", marginRight: 15 }}>
                <NiceInput
                  placeholder="First Name"
                  name="studentFirstName"
                  onChange={this.handleChange}
                />
              </GrayLine>
              <GrayLine>
                <NiceInput
                  placeholder="Last Name"
                  name="studentLastName"
                  onChange={this.handleChange}
                />
              </GrayLine>
            </Row>
            <Tiny>Student Email</Tiny>
            <GrayLine>
              <NiceInput
                placeholder="Student Email"
                name="studentEmail"
                onChange={this.handleChange}
              />
            </GrayLine>
            {this.state.studentEmail && (
              <div>
                <Checkbox
                  radio
                  label="Use as primary account email"
                  name="primary"
                  value="student"
                  checked={this.state.primary === "student"}
                  onChange={(e, { value }) => this.setState({ primary: value })}
                />
                <br />
                <br />
                <Checkbox
                  label="Receive email notifications"
                  checked={this.state.studentReceivesNotifications}
                  onChange={(e, { value }) =>
                    this.setState({ studentReceivesNotifications: value })
                  }
                />
              </div>
            )}
            <Tiny>
              Grade{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine style={{ width: "25%" }}>
              <Dropdown
                placeholder="Grade"
                options={gradeOptions}
                onChange={(e, data) => this.setState({ grade: data.value })}
              />
            </GrayLine>
            <Divider />
            <Tiny>
              Guardian Name{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <Row>
              <GrayLine style={{ width: "60%", marginRight: 15 }}>
                <NiceInput
                  placeholder="First Name"
                  name="parentFirstName"
                  onChange={this.handleChange}
                />
              </GrayLine>
              <GrayLine>
                <NiceInput
                  placeholder="Last Name"
                  name="parentLastName"
                  onChange={this.handleChange}
                />
              </GrayLine>
            </Row>
            <Tiny>
              Guardian Email{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine>
              <NiceInput
                placeholder="Parent Email"
                name="parentEmail"
                onChange={this.handleChange}
              />
            </GrayLine>
            {this.state.studentEmail && (
              <div>
                <Checkbox
                  radio
                  label="Use as primary account email"
                  name="primary"
                  value="parent"
                  checked={this.state.primary === "parent"}
                  onChange={(e, { value }) => this.setState({ primary: value })}
                />
                <br />
                <br />
              </div>
            )}
            <Checkbox
              label="Receive email notifications"
              checked={this.state.parentReceivesNotifications}
              onChange={(e, { value }) =>
                this.setState({ parentReceivesNotifications: value })
              }
            />
            <Divider />
            <Tiny>
              Password{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine>
              <NiceInput
                placeholder="Password"
                name="password"
                type="password"
                onChange={this.handleChange}
              />
            </GrayLine>
            <Tiny>
              Confirm Password{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine>
              <NiceInput
                placeholder="Confirm Password"
                name="confirm"
                type="password"
                onChange={this.handleChange}
              />
            </GrayLine>
            <Divider />
            <Tiny>
              How often do you expect to schedule tutoring?{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine>
              <Dropdown
                placeholder="Select one"
                options={scheduleOptions}
                onChange={(e, data) =>
                  this.setState({ selectedSchedule: data.value })
                }
              />
            </GrayLine>
            <Tiny>
              What subjects do you expect to schedule tutoring for?{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <Dropdown
              text={"Subjects"}
              fluid
              multiple
              selection
              scrolling
              options={subjectOptions}
              onChange={(e, { value }) =>
                this.setState({ selectedSubjects: value })
              }
            />
            <SmallButton type="submit" style={{ marginTop: 30 }}>
              <ButtonText>Sign Up</ButtonText>
            </SmallButton>
          </form>
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
  margin: 5% 0;
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

export default withRouter(ClientSignUp);
