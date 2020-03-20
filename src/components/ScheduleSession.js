import React, { Component } from "react";
import { Dropdown, TextArea } from "semantic-ui-react";

import styled from "styled-components";
import getSubject from "../subjects";

import firebase from "../firebase";
import { AiFillStar } from "react-icons/ai";

class ScheduleSession extends Component {
  constructor(props) {
    super(props);

    this.requestSession = this.requestSession.bind(this);
  }

  state = {
    subjectsAvailable: [],
    additionalInfo: ""
  };

  async componentDidMount() {
    let prefType = "";

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
  }

  requestSession() {
    if (
      !this.state.selectedSubject ||
      !this.state.selectedLength ||
      !this.state.selectedDateTime
    ) {
      alert("Please fill out all fields");
    } else {
      firebase.collection("sessions").add({
        client: this.props.client.id,
        start: this.state.selectedDateTime,
        end: new Date(
          this.state.selectedDateTime.getTime() +
            this.state.selectedLength * 60000
        ),
        status: "Requested",
        subjectID: this.state.selectedSubject,
        tutor: this.props.tutor.id
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

    const timeOptions = this.props.tutor.timePref.map(t => {
      const remainder = t % 60;
      const hours = (t - remainder) / 60;
      return {
        key: t,
        text:
          (hours < 1 ? "" : Math.floor(hours) + "hr ") +
          (remainder === 0 ? "" : remainder + "min"),
        value: t
      };
    });

    return (
      <Box>
        <Menu>
          {this.props.tutor.firstName}
          <Bar>
            <BetterStar size={25} favorite={this.props.favorite} />
            <Circle src={this.props.tutor.profilePic} />
          </Bar>
        </Menu>
        <Dropdown
          placeholder="Subject"
          fluid
          selection
          options={subjectOptions}
          onChange={(e, data) => this.setState({ selectedSubject: data.value })}
        />
        <Dropdown
          placeholder="Length"
          fluid
          selection
          options={timeOptions}
          onChange={(e, data) => this.setState({ selectedTime: data.value })}
        />
        <TextArea placeholder="Additional information" rows={2} />
        <GreenButton onClick={this.requestSession} cursor="pointer">
          <ButtonText>Request Session</ButtonText>
        </GreenButton>
      </Box>
    );
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

export default ScheduleSession;
