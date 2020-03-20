import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import firebase from "../firebase";
import styled from "styled-components";

const abbreviations = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

class AvailableTimes extends Component {
  constructor(props) {
    super(props);

    this.hourSlots = this.hourSlots.bind(this);
  }

  state = {};

  async componentDidMount() {
    const availRef = firebase.db
      .collection("opentimeslots")
      .where("uid", "==", this.props.tutor.id);

    const snapshot = await availRef.get();

    this.setState({
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

      while (start < t.end) {
        let nextHour = new Date(start.getTime());
        nextHour.setHours(nextHour.getHours() + 1);
        hourSlots.push({
          start: start,
          end: nextHour
        });
        start = nextHour;
      }
    });

    return hourSlots;
  }

  render() {
    if (!this.state.availableTimes) {
      return <p>Loading</p>;
    }

    const now = new Date();

    let daysInAdvance = 9;
    if (now.getDay() !== 6) {
      daysInAdvance -= now.getDay() + 1;
    }

    const hourSlots = this.hourSlots().filter(
      d => d.start > new Date(now.getTime()).setHours(now.getHours() + 1)
    );
    const range = Array.from(Array(daysInAdvance).keys());

    return (
      <Grid centered divided columns={daysInAdvance}>
        {range.map(d => {
          const date = new Date(now.getTime());
          date.setDate(now.getDate() + d);
          console.log(date);
          return (
            <Grid.Column textAlign="center">
              <p>
                {abbreviations[date.getDay()]} {date.getMonth()}/
                {date.getDate()}
              </p>
              {hourSlots
                .filter(s => s.start.getDate() === date.getDate())
                .map(s => (
                  <BetterP
                    selected={
                      this.props.selected
                        ? this.props.selected === s.start.getTime()
                        : false
                    }
                    onClick={() => this.props.callback(s)}
                  >
                    {s.start.getHours() % 12 === 0
                      ? 12
                      : s.start.getHours() % 12}{" "}
                    - {s.end.getHours() % 12 === 0 ? 12 : s.end.getHours() % 12}
                  </BetterP>
                ))}
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

const Col = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default AvailableTimes;
