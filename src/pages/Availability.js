import React, { Component } from "react";
import AvailableTimes from "react-available-times";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

class Availability extends Component {
  static contextType = userContext;

  state = {
    availableTimes: []
  };

  getPreviousMonday() {
    var date = new Date();
    if (date.getDay() != 0) return new Date().setDate(date.getDate() - 7 - 6);
    else return new Date().setDate(date.getDate() - date.getDate() - 6);
  }

  render() {
    console.log(this.state.availableTimes);
    return (
      <AvailableTimes
        weekStartsOn="monday"
        recurring={false}
        availableDays={[
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ]}
        onChange={availableTimes =>
          this.setState({
            availableTimes
          })
        }
        height={600}
        availableHourRange={{ start: 7, end: 22 }}
      />
    );
  }
}

export default Availability;
