import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import * as fb from "firebase";

import userContext from "../contexts/userContext";
import getSubject from "../subjects";

import { Popup, Divider } from "semantic-ui-react";
import { SubHeader, Small, Tiny } from "../styles";

import { fullTime, smallDayMonthDate } from "../timeFormatter";

import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineCheckSquare,
  AiOutlineCloseSquare,
  AiOutlineForm
} from "react-icons/ai";

class PastSession extends Component {
  state = {
    subject: "",
    w: {
      firstName: "",
      lastName: ""
    }
  };

  static contextType = userContext;

  async componentDidMount() {
    const subject = await getSubject(this.props.session.subjectID);

    const context = this.context;
    const withRef = firebase.db
      .collection(context.isTutor ? "clients" : "tutors")
      .doc(
        context.isTutor ? this.props.session.client : this.props.session.tutor
      );
    const w = await withRef.get();
    this.setState({
      subject: subject,
      w: w.data()
    });
  }
  render() {
    const startDate = this.props.session.start.toDate();
    const endDate = this.props.session.end.toDate();
    return (
      <Box>
        <Menu>
          <div>
            <SubHeader>{this.state.subject.title}</SubHeader>
            <Small>With {this.state.w.firstName}</Small>
          </div>
          <Bar>
            {this.state.w.profilePic && (
              <Circle src={this.state.w.profilePic} />
            )}
            {this.props.session.notes && (
              <AiOutlineForm
                size={14}
                style={{ cursor: "pointer", margin: "0 0 0 10px" }}
                onClick={() => this.setState({ notes: !this.state.notes })}
              />
            )}
          </Bar>
        </Menu>
        <Divider />
        {this.state.notes && <Tiny margin>{this.props.session.notes}</Tiny>}
        {!this.state.notes && (
          <div>
            <Tiny margin>
              <AiOutlineCalendar size={14} />
              {smallDayMonthDate(startDate)}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <AiOutlineClockCircle size={14} /> {fullTime(startDate, endDate)}
            </Tiny>
            <Tiny
              color={
                this.props.session.status === "Completed"
                  ? "#09AA82"
                  : "#FF8989"
              }
              margin
            >
              {this.props.session.status === "Completed" ? (
                <AiOutlineCheckSquare size={14} />
              ) : (
                <AiOutlineCloseSquare size={14} />
              )}{" "}
              {this.props.session.status}
            </Tiny>
          </div>
        )}
      </Box>
    );
  }
}

const Circle = styled.img`
  border-radius: 50%;
  width: 30px;
  height: 30px;
`;

const Notes = styled.p`
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
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export default PastSession;
