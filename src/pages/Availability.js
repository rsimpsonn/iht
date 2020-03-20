import React, { Component } from "react";
import AvailableTimes from "react-available-times";

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
      .collection("opentimeslots")
      .where("uid", "==", context.user.uid);

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

  submitTimes() {
    let allInitIds = this.state.initIds;
    const context = this.context;

    this.state.availableTimes.forEach(t => {
      if (t.id) {
        allInitIds = allInitIds.filter(i => i !== t.id);
        firebase.db
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
        firebase.db
          .collection("opentimeslots")
          .add({ uid: context.user.uid, start: t.start, end: t.end });
      }
    });

    allInitIds.forEach(id =>
      firebase.db
        .collection("opentimeslots")
        .doc(id)
        .delete()
    );
  }

  render() {
    if (!this.state.loaded) {
      return <p>Loading</p>;
    }
    return (
      <div>
        <button onClick={this.submitTimes}>Submit Times</button>
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
          initialSelections={this.state.availableTimes}
          height={600}
          availableHourRange={{ start: 7, end: 22 }}
        />
      </div>
    );
  }
}

export default Availability;
