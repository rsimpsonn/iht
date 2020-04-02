import React, { Component } from "react";
import AvailableTimes from "react-available-times";

import { SubHeader, Small, Tiny, ButtonText, SmallButton } from "../styles";
import { Divider } from "semantic-ui-react";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

class Availability extends Component {
  constructor(props) {
    super(props);

    this.submitTimes = this.submitTimes.bind(this);
  }
  static contextType = userContext;

  state = {
    availableTimes: []
  };

  getPreviousMonday() {
    var date = new Date();
    var day = date.getDay();
    var prevMonday;
    if (date.getDay() == 0) {
      prevMonday = new Date().setDate(date.getDate() - 7);
    } else {
      prevMonday = new Date().setDate(date.getDate() - day);
    }

    return prevMonday;
  }

  async componentDidMount() {
    const context = this.context;

    console.log(context.user.uid);
    const availRef = firebase.db
      .collection("tutors")
      .doc(context.user.uid)
      .collection("opentimeslots");

    const availabilities = await availRef.get();

    console.log(availabilities);

    this.setState({
      availableTimes: availabilities.docs.map(d => {
        return {
          start: d.data().start.toDate(),
          end: d.data().end.toDate(),
          id: d.id
        };
      }),
      initIds: availabilities.docs.map(d => d.id),
      loaded: true
    });
  }

  async submitTimes() {
    let allInitIds = this.state.initIds;
    const context = this.context;

    const now = new Date();
    if (now.getDay() > 2 && now.getDay() < 6) {
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() - nextMonday.getDay() + 8);
      const nextSunday = new Date();
      nextSunday.setDate(nextMonday.getDate() + 6);

      if (
        this.state.availableTimes.filter(
          t =>
            t.start.getDate() >= nextMonday.getDate() &&
            t.start.getDate() <= nextSunday.getDate()
        ).length > 0
      ) {
        firebase.db
          .collection("tutors")
          .doc(context.user.uid)
          .set(
            {
              availableNextWeek: true
            },
            { merge: true }
          );
      }
    }

    this.state.availableTimes.forEach(async t => {
      if (t.id) {
        allInitIds = allInitIds.filter(i => i !== t.id);
        const q = await firebase.db
          .collection("tutors")
          .doc(context.user.uid)
          .collection("opentimeslots")
          .doc(t.id)
          .set(
            {
              start: t.start,
              end: t.end
            },
            { merge: true }
          );
      } else {
        const s = await firebase.db
          .collection("tutors")
          .doc(context.user.uid)
          .collection("opentimeslots")
          .add({ start: t.start, end: t.end });
      }
    });

    allInitIds.forEach(async id => {
      const r = await firebase.db
        .collection("tutors")
        .doc(context.user.uid)
        .collection("opentimeslots")
        .doc(id)
        .delete();
    });

    this.setState({
      newChanges: false
    });
  }

  render() {
    if (!this.state.loaded) {
      return <p>Loading</p>;
    }
    return (
      <div style={{ padding: "2%" }}>
        <SubHeader margin>Set your availability</SubHeader>
        <Small>
          Drag your mouse over the calendar to create new time slots. Hover over
          time slots you have already created to remove them.
          <br />
          <br />
          Please note: all tutoring sessions are one hour long, and all time
          slots you submit will appear to clients as a list of one hour slots.
          For example, if you set 3-6PM as an open time slot, clients will be
          able to request a session with you from 3-4PM, 4-5PM, and 5-6PM.
        </Small>
        <Divider />
        {!this.state.newChanges && <Tiny>All time slots saved.</Tiny>}
        {this.state.newChanges && (
          <SmallButton
            style={{ width: "15%", margin: 0 }}
            onClick={this.submitTimes}
          >
            <ButtonText>Confirm Availability</ButtonText>
          </SmallButton>
        )}
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
              availableTimes,
              newChanges: true
            })
          }
          initialSelections={this.state.availableTimes}
          height={600}
          availableHourRange={{ start: 7, end: 22 }}
        />
      </div>
    );
  }
}

export default Availability;
