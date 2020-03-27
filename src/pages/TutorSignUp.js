import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";

import { getAllUniversities } from "../universities";
import { getAllMajors } from "../majors";

import firebase from "../firebase";

import { Checkbox, Divider, Dropdown } from "semantic-ui-react";

import { SmallButton, ButtonText, Tiny, Header } from "../styles";

const monthOptions = [
  {
    text: "January",
    value: 1,
    key: 1
  },
  {
    text: "February",
    value: 2,
    key: 2
  },
  {
    text: "March",
    value: 3,
    key: 3
  },
  {
    text: "April",
    value: 4,
    key: 4
  },
  {
    text: "May",
    value: 5,
    key: 5
  },
  {
    text: "June",
    value: 6,
    key: 6
  },
  {
    text: "July",
    value: 7,
    key: 7
  },
  {
    text: "August",
    value: 8,
    key: 8
  },
  {
    text: "September",
    value: 9,
    key: 9
  },
  {
    text: "October",
    value: 10,
    key: 10
  },
  {
    text: "November",
    value: 11,
    key: 11
  },
  {
    text: "December",
    value: 12,
    key: 12
  }
];

class TutorSignUp extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadUniversities = this.loadUniversities.bind(this);
  }

  state = {
    primary: "parent",
    studentReceivesNotifications: true,
    parentReceivesNotifications: true
  };

  handleChange(e) {
    console.log(e.target.name, e.target.value);
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  async loadUniversities() {
    const universities = await getAllUniversities();

    this.setState({
      universities
    });
  }

  async loadMajors() {
    const majors = await getAllMajors();

    this.setState({
      majors
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (
      this.state.firstName &&
      this.state.lastName &&
      this.state.email &&
      this.state.selectedYear &&
      this.state.selectedUniversity &&
      this.state.selectedMajor &&
      this.state.selectedMonth &&
      this.state.day &&
      this.state.birthYear &&
      this.state.password &&
      this.state.confirm
    ) {
      if (this.state.password !== this.state.confirm) {
        alert("Please enter matching passwords");
        return;
      }

      let user = {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        year: this.state.selectedYear,
        birthDate: `${this.state.selectedMonth} ${this.state.day}, ${this.state.birthYear}`,
        university: this.state.selectedUniversity,
        major: this.state.selectedMajor,
        answers: {
          subject: this.state.selectedSubjects,
          schedule: this.state.selectedSchedule
        }
      };

      const signedUp = await firebase.auth.createUserWithEmailAndPassword(
        this.state.email,
        this.state.password
      );

      if (signedUp.user !== null) {
        signedUp.user.sendEmailVerification();

        firebase.db
          .collection("users")
          .doc(signedUp.user.uid)
          .set({ isTutor: true });

        firebase.db
          .collection("tutors")
          .doc(signedUp.user.uid)
          .set(user);

        this.props.history.push("/dashboard");
      } else {
        alert("There was a problem with the sign up process.");
      }
    } else {
      alert("There are fields missing");
    }
  }

  render() {
    let universityOptions = [];

    if (!this.state.universities) {
      this.loadUniversities();
    } else {
      universityOptions = this.state.universities.map(u => {
        return {
          text: u.title,
          value: u.id,
          key: u.id
        };
      });
    }

    let majorOptions = [];

    if (!this.state.majors) {
      this.loadMajors();
    } else {
      majorOptions = this.state.majors.map(m => {
        return {
          text: m.title,
          value: m.id,
          key: m.id
        };
      });
    }

    const now = new Date();

    let additions = [];

    if (now.getMonth() > 4) {
      additions = [1, 2, 3, 4];
    } else {
      additions = [0, 1, 2, 3];
    }

    const yearOptions = additions.map(a => {
      const year = now.getFullYear() + a;
      return {
        key: a,
        text: year,
        value: year
      };
    });

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

    return (
      <Center>
        <Container>
          <Header margin>Sign Up</Header>
          <form onSubmit={this.handleSubmit}>
            <Tiny>
              Name <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <Row>
              <GrayLine style={{ width: "60%", marginRight: 15 }}>
                <NiceInput
                  placeholder="First Name"
                  name="firstName"
                  onChange={this.handleChange}
                />
              </GrayLine>
              <GrayLine>
                <NiceInput
                  placeholder="Last Name"
                  name="lastName"
                  onChange={this.handleChange}
                />
              </GrayLine>
            </Row>
            <Tiny>
              Email{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine>
              <NiceInput
                placeholder="School Email"
                name="email"
                onChange={this.handleChange}
              />
            </GrayLine>
            <Tiny>
              Date of birth{" "}
              <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <Row>
              <GrayLine style={{ marginRight: 20 }}>
                <Dropdown
                  placeholder="Month"
                  options={monthOptions}
                  onChange={(e, data) =>
                    this.setState({ selectedMonth: data.value })
                  }
                />
              </GrayLine>
              <GrayLine>
                <NiceInput
                  placeholder="Day"
                  name="day"
                  onChange={this.handleChange}
                />
              </GrayLine>
              <GrayLine style={{ marginLeft: 20 }}>
                <NiceInput
                  placeholder="Year"
                  name="birthYear"
                  onChange={this.handleChange}
                />
              </GrayLine>
            </Row>
            <Divider />
            <Row>
              <div style={{ marginRight: 20, minWidth: 160 }}>
                <Tiny>
                  University{" "}
                  <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
                </Tiny>
                <GrayLine>
                  <Dropdown
                    options={universityOptions}
                    placeholder="University"
                    scrolling
                    onChange={(e, data) =>
                      this.setState({ selectedUniversity: data.value })
                    }
                  />
                </GrayLine>
              </div>
              <div style={{ minWidth: 140 }}>
                <Tiny>
                  Major{" "}
                  <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
                </Tiny>
                <GrayLine>
                  <Dropdown
                    options={majorOptions}
                    placeholder="Major"
                    scrolling
                    onChange={(e, data) =>
                      this.setState({ selectedMajor: data.value })
                    }
                  />
                </GrayLine>
              </div>
            </Row>
            <Tiny>
              Year <span style={{ fontWeight: "Bold", color: "black" }}>*</span>
            </Tiny>
            <GrayLine style={{ width: 80 }}>
              <Dropdown
                options={yearOptions}
                placeholder="Year"
                scrolling
                onChange={(e, data) =>
                  this.setState({ selectedYear: data.value })
                }
              />
            </GrayLine>
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
              How often would you like to tutor?{" "}
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
              What subjects would you like to tutor?{" "}
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

export default withRouter(TutorSignUp);
