import React, { Component } from "react";
import { Dropdown, TextArea, Popup, Divider } from "semantic-ui-react";

import AvailableTimes from "./AvailableTimes";

import styled from "styled-components";
import getSubject from "../subjects";

import firebase from "../firebase";
import {
  AiFillStar,
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineStar
} from "react-icons/ai";
import { SubHeader, Small, Tiny } from "../styles";
import getUniversity from "../universities";

class ScheduleSession extends Component {
  constructor(props) {
    super(props);

    this.requestSession = this.requestSession.bind(this);
    this.setFavorite = this.setFavorite.bind(this);
  }

  state = {
    subjectsAvailable: [],
    additionalInfo: "",
    frontSide: true,
    university: ""
  };

  async componentDidMount() {
    this.setState({
      favorite: this.props.favorite
    });
    let prefType = "";
    const university = await getUniversity(this.props.tutor.universityID);

    switch (this.props.client.educationID) {
      case "0":
        prefType = "elementaryPref";
      case "1":
        prefType = "middlePref";
      case "2":
        prefType = "highPref";
      case "3":
        prefType = "collegePref";
      default:
        prefType = "elementaryPref";
    }

    if (this.props.tutor[prefType]) {
      Promise.all(this.props.tutor[prefType].map(f => getSubject(f))).then(
        subjectsAvailable => this.setState({ subjectsAvailable })
      );
    }

    this.setState({
      university: university
    });
  }

  setFavorite() {
    this.setState({
      favorite: !this.state.favorite
    });
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
        additionalInfo: this.state.additionalInfo
      });
    }
  }

  render() {
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

    return (
      <Box>
        <Menu>
          <SubHeader>{this.props.tutor.firstName}</SubHeader>
          <Bar>
            {this.state.favorite && (
              <BetterStar size={20} onClick={this.setFavorite} />
            )}
            {!this.state.favorite && (
              <BetterOutlineStar size={20} onClick={this.setFavorite} />
            )}
            {!this.state.frontSide && (
              <Circle src={this.props.tutor.profilePic} />
            )}
            {this.state.frontSide && (
              <Popup
                trigger={<Circle src={this.props.tutor.profilePic} />}
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
              fluid
              selection
              options={subjectOptions}
              onChange={(e, data) =>
                this.setState({ selectedSubject: data.value })
              }
            />
            <Popup trigger={<p>{selectTimeText}</p>} hoverable fluid flowing>
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
            <TextArea
              onChange={e => this.setState({ additionalInfo: e.target.value })}
              placeholder="Additional information"
              rows={2}
            />
            <GreenButton onClick={this.requestSession}>
              <ButtonText>Request Session</ButtonText>
            </GreenButton>
          </div>
        )}
        {!this.state.frontSide && (
          <div>
            <p>
              {this.props.tutor.year} {","} {this.state.university.title}
            </p>
            <p>{"Studying" + " " + this.props.tutor.majorID}</p>
            <p>{this.props.tutor.bio}</p>

            <Menu>
              <BetterStar size={25} favorite={this.props.favorite} />
              <BetterStar size={25} favorite={this.props.favorite} />
              <BetterStar size={25} favorite={this.props.favorite} />
              <BetterStar size={25} favorite={this.props.favorite} />
              <BetterStar size={25} favorite={this.props.favorite} />
              <GreenButton
                onClick={() =>
                  this.setState({ frontSide: !this.state.frontSide })
                }
              >
                <ButtonText>Schedule</ButtonText>
              </GreenButton>
            </Menu>
            <p>{this.props.tutor.sessions + " sessions"}</p>
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

const Circle = styled.img`
  border-radius: 50%;
  width: 30px;
  height: 30px;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  margin: 0 15px;
  padding: 15px;
  width: 17.5%;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const GreenButton = styled.div`
  border-radius: 20px;
  background-color: #09aa82;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonText = styled.p`
  font-family: Lato;
  font-size: 14px;
  color: white;
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

const Info = styled.p`
  &:hover {
    transform: scale(1.1);
  }
`;

export default ScheduleSession;
