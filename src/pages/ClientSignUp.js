import React, { useState } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

import firebase from "../firebase";

import { Checkbox, Divider, Dropdown } from "semantic-ui-react";

import { SmallButton, ButtonText, Tiny, Header } from "../styles";

import { useMediaQuery } from "react-responsive";

function ClientSignUp(props) {
  const [state, setState] = useState({
    primary: "parent",
    studentReceivesNotifications: true,
    parentReceivesNotifications: true
  });

  function handleChange(e) {
    console.log(state);
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  }

  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  async function handleSubmit(e) {
    console.log(state);
    e.preventDefault();

    if (
      state.studentFirstName &&
      state.studentLastName &&
      state.parentFirstName &&
      state.parentLastName &&
      state.parentEmail &&
      state.grade &&
      state.selectedSubjects &&
      state.selectedSchedule &&
      state.password &&
      state.confirm
    ) {
      if (state.password !== state.confirm) {
        alert("Please enter matching passwords");
        return;
      }

      let educationID = Math.floor(state.grade / 5);
      if (state.grade === 9) {
        educationID += 1;
      }

      if (state.grade === 5) {
        educationID -= 1;
      }

      let user = {
        firstName: state.studentFirstName,
        lastName: state.studentLastName,
        grade: state.grade,
        educationID: educationID.toString(),
        parent: {
          firstName: state.parentFirstName,
          lastName: state.parentLastName
        },
        emailNotifications: [],
        answers: {
          subject: state.selectedSubjects,
          schedule: state.selectedSchedule
        }
      };

      if (state.parentReceivesNotifications) {
        user.emailNotifications.push(state.parentEmail);
      }

      let primaryEmail = state.parentEmail;
      if (state.studentEmail) {
        if (state.primary === "student") {
          primaryEmail = state.studentEmail;
          user.parent.email = state.parentEmail;
        } else {
          user.studentEmail = state.studentEmail;
        }

        if (state.studentReceivesNotifications) {
          user.emailNotifications.push(state.studentEmail);
        }
      }

      const signedUp = await firebase.auth.createUserWithEmailAndPassword(
        primaryEmail,
        state.password
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

        props.history.push("/dashboard");
      } else {
        alert("There was a problem with the sign up process.");
      }
    } else {
      alert("There are fields missing");
    }
  }

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
      <Container portrait={isPortrait}>
        <Header margin>Sign Up</Header>
        <form onSubmit={handleSubmit}>
          <Tiny>
            Student Name{" "}
            <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
          </Tiny>
          <Row>
            <GrayLine style={{ width: "60%", marginRight: 15 }}>
              <NiceInput
                placeholder="First Name"
                name="studentFirstName"
                onChange={handleChange}
              />
            </GrayLine>
            <GrayLine>
              <NiceInput
                placeholder="Last Name"
                name="studentLastName"
                onChange={handleChange}
              />
            </GrayLine>
          </Row>
          <Tiny>Student Email</Tiny>
          <GrayLine>
            <NiceInput
              placeholder="Student Email"
              name="studentEmail"
              onChange={handleChange}
            />
          </GrayLine>
          {state.studentEmail && (
            <div>
              <Checkbox
                radio
                label="Use as primary account email"
                name="primary"
                value="student"
                checked={state.primary === "student"}
                onChange={(e, { value }) =>
                  setState({ ...state, primary: value })
                }
              />
              <br />
              <br />
              <Checkbox
                label="Receive email notifications"
                checked={state.studentReceivesNotifications}
                onChange={(e, { value }) =>
                  setState({ ...state, studentReceivesNotifications: value })
                }
              />
            </div>
          )}
          <Tiny>
            Grade <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
          </Tiny>
          <GrayLine style={{ width: "25%" }}>
            <Dropdown
              placeholder="Grade"
              options={gradeOptions}
              onChange={(e, data) => setState({ ...state, grade: data.value })}
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
                onChange={handleChange}
              />
            </GrayLine>
            <GrayLine>
              <NiceInput
                placeholder="Last Name"
                name="parentLastName"
                onChange={handleChange}
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
              onChange={handleChange}
            />
          </GrayLine>
          {state.studentEmail && (
            <div>
              <Checkbox
                radio
                label="Use as primary account email"
                name="primary"
                value="parent"
                checked={state.primary === "parent"}
                onChange={(e, { value }) =>
                  setState({ ...state, primary: value })
                }
              />
              <br />
              <br />
            </div>
          )}
          <Checkbox
            label="Receive email notifications"
            checked={state.parentReceivesNotifications}
            onChange={(e, { value }) =>
              setState({ ...state, parentReceivesNotifications: value })
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
              onChange={handleChange}
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
              onChange={handleChange}
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
                setState({ ...state, selectedSchedule: data.value })
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
              setState({ ...state, selectedSubjects: value })
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
  width: 30%;
  margin: 5% 0;

  ${props =>
    props.portrait &&
    `
    width: 80%;
    `}
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
