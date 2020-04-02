import React, { Component } from "react";
import { Dropdown, TextArea, Popup, Divider } from "semantic-ui-react";

import AvailableTimes from "./AvailableTimes";
import { smallDayMonthDateFullTime } from "../timeFormatter";

import styled from "styled-components";
import getSubject from "../subjects";
import getMajor from "../majors";

import firebase from "../firebase";
import {
  AiFillStar,
  AiOutlineCalendar,
  AiOutlineStar,
  AiOutlineBank,
  AiOutlineBook
} from "react-icons/ai";

import { MdStar, MdStarHalf, MdStarBorder } from "react-icons/md";
import { SubHeader, Small, Tiny, SmallButton, ButtonText } from "../styles";
import getUniversity from "../universities";

class ScheduleSession extends Component {
  constructor(props) {
    super(props);

    this.requestSession = this.requestSession.bind(this);
    this.setFavorite = this.setFavorite.bind(this);
    this.loadUniversity = this.loadUniversity.bind(this);
    this.loadMajor = this.loadMajor.bind(this);
  }

  state = {
    subjectsAvailable: [],
    frontSide: true,
    university: ""
  };

  async componentDidMount() {
    this.setState({
      favorite: this.props.favorite,
      frontSide: !this.props.bio,
      university: this.props.university ? this.props.university : "",
      major: this.props.major ? this.props.major : ""
    });
    const prefs = ["elementaryPref", "middlePref", "highPref"];
    const prefType = prefs[parseInt(this.props.client.educationID)];

    console.log(prefType);

    if (this.props.tutor[prefType]) {
      Promise.all(this.props.tutor[prefType].map(f => getSubject(f))).then(
        subjectsAvailable => this.setState({ subjectsAvailable })
      );
    }
  }

  setFavorite() {
    this.setState({
      favorite: !this.state.favorite
    });
  }

  async loadUniversity() {
    const university = await getUniversity(this.props.tutor.universityID);

    this.setState({
      university
    });
  }

  async loadMajor() {
    const major = await getMajor(this.props.tutor.majorID);

    this.setState({
      major
    });
  }

  updateFavorite(action) {
    let updatedFavorites = this.props.client.favorites;

    if (action) {
      updatedFavorites.splice(updatedFavorites.indexOf(this.props.tutor.id), 1);
    } else {
      if (!updatedFavorites.includes(this.props.tutor.id)) {
        updatedFavorites.push(this.props.tutor.id);
      }
    }

    this.props.toggleFavorite();

    firebase.db
      .collection("clients")
      .doc(this.props.client.id)
      .set({ favorites: updatedFavorites }, { merge: true });
  }

  requestSession() {
    if (!this.state.selectedSubject || !this.state.selectedTimeSlot) {
      alert("Please fill out all fields");
    } else {
      firebase.db.collection("sessions").add({
        client: this.props.client.id,
        start: this.state.selectedTimeSlot.start,
        end: this.state.selectedTimeSlot.end,
        status: "Requested",
        subjectID: this.state.selectedSubject,
        tutor: this.props.tutor.id,
        recurring: this.state.recurring
      });
    }
  }

  render() {
    let university = "";

    if (this.state.university) {
      university = this.state.university.title;
    } else {
      this.loadUniversity();
    }

    let major = "";

    if (this.state.major) {
      major = this.state.major.title;
    } else {
      this.loadMajor();
    }

    const subjectOptions = this.state.subjectsAvailable.map(s => {
      return {
        key: s.id,
        text: s.title,
        value: s.id
      };
    });

    const s = this.state.selectedTimeSlot;

    const selectTimeText = s
      ? (s.start.getHours() % 12 === 0 ? 12 : s.start.getHours() % 12) +
        " - " +
        (s.end.getHours() % 12 === 0 ? 12 : s.end.getHours() % 12)
      : "Select Time";

    let stars = [];

    for (let i = 1; i < 6; i++) {
      const diff = this.props.tutor.rating - i;

      if (diff > -0.2) {
        stars.push(<MdStar size={12} color="#09AA82" />);
      } else if (diff > -0.65) {
        stars.push(<MdStarHalf size={12} color="#09AA82" />);
      } else {
        stars.push(<MdStarBorder size={12} color="#09AA82" />);
      }
    }

    const recurringOptions = [
      {
        key: 0,
        value: 0,
        text: "One time"
      },
      {
        key: 1,
        value: 1,
        text: "Weekly"
      }
    ];

    return (
      <Box>
        <Menu>
          <div>
            <SubHeader>{this.props.tutor.firstName}</SubHeader>
            {this.props.tutor.sessions > 0 && (
              <Row>
                {stars}{" "}
                <Tiny style={{ marginLeft: 6 }}>
                  ({this.props.tutor.sessions})
                </Tiny>
              </Row>
            )}
            {this.props.tutor.sessions === 0 && <Tiny>New tutor</Tiny>}
          </div>
          <Bar>
            {this.state.favorite && (
              <BetterStar
                size={20}
                onClick={() => {
                  this.updateFavorite(true);
                  this.setFavorite();
                }}
              />
            )}
            {!this.state.favorite && (
              <BetterOutlineStar
                size={20}
                onClick={() => {
                  this.updateFavorite(false);
                  this.setFavorite();
                }}
              />
            )}
            {!this.state.frontSide && (
              <Circle image={this.props.tutor.profilePic}>
                {!this.props.tutor.profilePic && (
                  <SubHeader color="white">
                    {this.props.tutor.firstName.substring(0, 1)}
                  </SubHeader>
                )}
              </Circle>
            )}
            {this.state.frontSide && (
              <Popup
                trigger={
                  <Circle image={this.props.tutor.profilePic}>
                    {!this.props.tutor.profilePic && (
                      <SubHeader color="white">
                        {this.props.tutor.firstName.substring(0, 1)}
                      </SubHeader>
                    )}
                  </Circle>
                }
                position="top center"
                flowing
                hoverable
                onClick={() =>
                  this.setState({ frontSide: !this.state.frontSide })
                }
              >
                <p>
                  <Info>More Info</Info>
                </p>
              </Popup>
            )}
          </Bar>
        </Menu>
        <Divider />
        {this.state.frontSide && (
          <div>
            <Dropdown
              placeholder="Subject"
              style={{ margin: "10px 0" }}
              fluid
              selection
              options={subjectOptions}
              onChange={(e, data) =>
                this.setState({ selectedSubject: data.value })
              }
            />
            <Popup
              trigger={
                <GrayLine style={{ margin: "10px 0" }}>
                  <Small
                    color={
                      this.state.selectedTimeSlot
                        ? "black"
                        : "rgba(191,191,191,.87)"
                    }
                  >
                    {!this.state.selectedTimeSlot
                      ? "Select Time"
                      : smallDayMonthDateFullTime(
                          this.state.selectedTimeSlot.start,
                          this.state.selectedTimeSlot.end
                        )}
                  </Small>
                </GrayLine>
              }
              hoverable
              fluid
              flowing
            >
              <AvailableTimes
                callback={selectedTimeSlot =>
                  this.setState({ selectedTimeSlot })
                }
                tutor={this.props.tutor}
                selected={
                  this.state.selectedTimeSlot
                    ? this.state.selectedTimeSlot.start.getTime()
                    : false
                }
              />
            </Popup>
            <Dropdown
              defaultValue={0}
              style={{ margin: "10px 0" }}
              fluid
              selection
              options={recurringOptions}
              onChange={(e, data) =>
                this.setState({ recurring: data.value === 1 })
              }
            />
            <Divider />
            <SmallButton onClick={this.requestSession}>
              <ButtonText>Request Session</ButtonText>
            </SmallButton>
          </div>
        )}
        {!this.state.frontSide && (
          <div>
            {this.props.tutor.bio && (
              <div style={{ marginBottom: 10 }}>
                <Tiny>Bio</Tiny>
                <Small color="black">{this.props.tutor.bio}</Small>
              </div>
            )}
            {university && (
              <Tiny>
                <AiOutlineBank size={14} /> {university}
              </Tiny>
            )}
            {major && (
              <Tiny>
                <AiOutlineBook size={14} /> {major}
              </Tiny>
            )}
            <Tiny>
              <AiOutlineCalendar size={14} /> Graduating {this.props.tutor.year}
            </Tiny>
            <Divider />
            <SmallButton
              onClick={() =>
                this.setState({ frontSide: !this.state.frontSide })
              }
            >
              <ButtonText>Schedule</ButtonText>
            </SmallButton>
          </div>
        )}
      </Box>
    );
  }
}

const BetterStar = styled(AiFillStar)`
  color: #09aa82;
  margin: 0 5px;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const BetterOutlineStar = styled(AiOutlineStar)`
  color: #09aa82;
  margin: 0 5px;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  margin: 0 15px;
  padding: 15px;
  min-width: 240px;
  width: 17.5%;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const GrayLine = styled.div`
  padding: 8px 12px;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3em;
`;

const Info = styled.p`
  &:hover {
    transform: scale(1.1);
  }
`;

const Circle = styled.div`
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background-color: #09aa82;
  background-size: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-repeat: "no-repeat";

  ${props =>
    props.image &&
    `
      background-image: url(${props.image})`}
`;

export default ScheduleSession;
