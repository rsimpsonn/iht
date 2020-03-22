import React, { Component } from "react";
import { Dropdown, TextArea, Popup } from "semantic-ui-react";

import AvailableTimes from "./AvailableTimes";

import styled from "styled-components";
import getSubject from "../subjects";

import firebase from "../firebase";
import { AiFillStar } from "react-icons/ai";
import getUniversity from "../universities";

class ScheduleSession extends Component {
  constructor(props) {
    super(props);

    this.requestSession = this.requestSession.bind(this);
  }

  state = {
    subjectsAvailable: [],
    additionalInfo: "",
    frontSide: true,
    university: "",
  };

  async componentDidMount() {
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

    if(this.state.frontSide){
      return (
        <Box>
          <Menu>
            {this.props.tutor.firstName}
            
            <Bar>
              <BetterStar size={25} favorite={this.props.favorite} />
              <Popup
              trigger={<Circle src={this.props.tutor.profilePic} />}
              position="top center"
              flowing
              hoverable
              onClick={() => this.setState({ frontSide: !this.state.frontSide})}
            >
              <p>
                <Info>More Info</Info>
              </p>
            </Popup>
            </Bar>
          </Menu>
          <Dropdown
            placeholder="Subject"
            fluid
            selection
            options={subjectOptions}
            onChange={(e, data) => this.setState({ selectedSubject: data.value })}
          />
          <Popup trigger={<p>{selectTimeText}</p>} hoverable fluid flowing>
            <AvailableTimes
              callback={selectedTimeSlot => this.setState({ selectedTimeSlot })}
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
        </Box>

        
      );
     } else{
      return (
        <Box>
          <Menu>
            {this.props.tutor.firstName}
            <Bar>
             <BetterStar size={25} favorite={this.props.favorite} />
              <Circle src={this.props.tutor.profilePic} />
            </Bar>
          </Menu>
          <p>{this.props.tutor.year} {","} {this.state.university.title}</p>
          <p>{"Studying" + " " + this.props.tutor.majorID}</p>
          <p>{this.props.tutor.bio}</p>

          <Menu>
          <BetterStar size={25} favorite={this.props.favorite} />
          <BetterStar size={25} favorite={this.props.favorite} />
          <BetterStar size={25} favorite={this.props.favorite} />
          <BetterStar size={25} favorite={this.props.favorite} />
          <BetterStar size={25} favorite={this.props.favorite} />
          <GreenButton 
          onClick={() => this.setState({ frontSide: !this.state.frontSide})}>
            <ButtonText>Schedule</ButtonText>
          </GreenButton>
          </Menu>
          <p>{this.props.tutor.sessions + " sessions"}</p>
        </Box>
        
      );
      }
  }
}

const BetterStar = styled(AiFillStar)`
  color: #f3f3f3;

  ${props =>
    props.favorite &&
    `
    color: #09aa82;
  `}
`;

const Circle = styled.img`
  border-radius: 50%;
  width: 25px;
  height: 25px;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #f6f6f6;
  padding: 15px;
  width: 15%;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
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
`;

const Info = styled.p`
  &:hover {
    transform: scale(1.1);
  }
`;

export default ScheduleSession;
