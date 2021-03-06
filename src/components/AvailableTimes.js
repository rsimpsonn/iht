import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import firebase from "../firebase";
import styled from "styled-components";

import { Small, Tiny } from "../styles";
import { fullTime } from "../timeFormatter";

const abbreviations = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

class AvailableTimes extends Component {
  constructor(props) {
    super(props);

    this.hourSlots = this.hourSlots.bind(this);
    this.getOverlappingSessions = this.getOverlappingSessions.bind(this);
  }

  state = {};

  async componentDidMount() {
    const availRef = firebase.db
      .collection("tutors")
      .doc(this.props.tutor.id)
      .collection("opentimeslots");

    const snapshot = await availRef.get();

    const overlappingSessions = await this.getOverlappingSessions();

    this.setState({
      overlappingSessions,
      availableTimes: snapshot.docs.map(d => {
        return {
          start: d.data().start.toDate(),
          end: d.data().end.toDate()
        };
      })
    });
  }

  hourSlots() {
    let hourSlots = [];

    this.state.availableTimes.forEach(t => {
      let start = t.start;
      const increment = this.props.minutes ? this.props.minutes : 60;

      while (start < t.end) {
        let nextHour = new Date(start.getTime());
        nextHour.setMinutes(nextHour.getMinutes() + increment);
        hourSlots.push({
          start: start,
          end: nextHour
        });
        start = nextHour;
      }
    });

    return hourSlots;
  }

  async getOverlappingSessions() {
    const now = new Date();

    let daysInAdvance = 9;
    if (this.props.daysInAdvance) {
      daysInAdvance = this.props.daysInAdvance;
    } else {
      if (now.getDay() !== 6) {
        daysInAdvance -= now.getDay() + 1;
      }
    }

    let advance = new Date();
    advance.setDate(advance.getDate() + daysInAdvance);
    advance.setHours(22);

    const sessionRef = firebase.db
      .collection("sessions")
      .where("tutor", "==", this.props.tutor.id)
      .where("start", ">=", now)
      .where("start", "<", advance)
      .where("status", "in", ["Upcoming", "Requested"]);

    const snapshot = await sessionRef.get();

    return snapshot.docs.map(s => {
      return {
        start: s.data().start.toDate(),
        end: s.data().start.toDate()
      };
    });
  }

  render() {
    if (!this.state.availableTimes) {
      return <p>Loading</p>;
    }

    const now = new Date();

    let daysInAdvance = 9;
    if (this.props.daysInAdvance) {
      daysInAdvance = this.props.daysInAdvance;
    } else {
      if (now.getDay() !== 6) {
        daysInAdvance -= now.getDay() + 1;
      }
    }

    const filterValue = new Date();
    if (this.props.delay) {
      filterValue.setDate(now.getDate() + Math.floor(this.props.delay / 24));
      filterValue.setHours(now.getHours() + (this.props.delay % 24));
    } else {
      filterValue.setHours(now.getHours() + 1);
    }

    const hourSlots = this.hourSlots()
      .filter(d => d.start.getTime() > filterValue.getTime())
      .filter(
        s =>
          !this.state.overlappingSessions.some(
            o => s.start.getHours() === o.start.getHours()
          )
      );
    const range = Array.from(Array(daysInAdvance).keys());
    const formatter = this.props.formatter ? this.props.formatter : fullTime;

    return (
      <Grid centered divided columns={daysInAdvance}>
        {range.map(d => {
          const date = new Date(now.getTime());
          date.setDate(now.getDate() + d);
          return (
            <Grid.Column
              style={{ width: this.props.wide ? 180 : 140 }}
              textAlign="center"
            >
              <Tiny>
                {abbreviations[date.getDay()]} {date.getMonth()}/
                {date.getDate()}
              </Tiny>
              <Scroll>
                {hourSlots
                  .filter(s => s.start.getDate() === date.getDate())
                  .map(s => (
                    <GrayLine onClick={() => this.props.callback(s)}>
                      <Tiny bold={this.props.selected === s.start.getTime()}>
                        {formatter(s.start, s.end)}
                      </Tiny>
                    </GrayLine>
                  ))}
              </Scroll>
            </Grid.Column>
          );
        })}
      </Grid>
    );
  }
}

const BetterP = styled.p`
  cursor: pointer;

  ${props =>
    props.selected &&
    `
    font-weight: bold;
    `}
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: start;
`;

const GrayLine = styled.div`
  padding: 8px 12px;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3em;
  margin: 10px 0;
  cursor: pointer;
`;

const Scroll = styled.div`
  overflow-y: scroll;
  max-height: 300px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default AvailableTimes;
