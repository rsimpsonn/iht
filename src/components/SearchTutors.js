import React, { Component } from "react";
import styled from "styled-components";

import { Dropdown, Divider, Loader } from "semantic-ui-react";

import ScheduleSession from "./ScheduleSession";

import { SubHeader, Tiny } from "../styles";

import { getAllMajors } from "../majors";
import { getAllUniversities } from "../universities";
import { getAllSubjects } from "../subjects";

import userDetailsContext from "../contexts/userDetailsContext";

import firebase from "../firebase";

class SearchTutors extends Component {
  constructor(props) {
    super(props);

    this.loadMajors = this.loadMajors.bind(this);
    this.loadUniversities = this.loadUniversities.bind(this);
    this.loadSubjects = this.loadSubjects.bind(this);
    this.loadTutors = this.loadTutors.bind(this);
    this.filterLoadedTutors = this.filterLoadedTutors.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    loading: false,
    searchOrder: []
  };

  static contextType = userDetailsContext;

  async loadMajors() {
    const majors = await getAllMajors();

    this.setState({
      majors
    });
  }

  async loadUniversities() {
    const universities = await getAllUniversities();

    this.setState({
      universities
    });
  }

  hourSlots(times) {
    let hourSlots = [];

    times.forEach(t => {
      let start = t.start;
      const increment = 60;

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

  async loadSubjects() {
    const subjects = await getAllSubjects();

    this.setState({
      subjects: subjects.filter(
        s =>
          s.level.toString() === this.context.userDetails.educationID.toString()
      )
    });
  }

  async loadTutors() {
    const now = new Date();
    let daysInAdvance = 9;
    if (now.getDay() !== 6) {
      daysInAdvance -= now.getDay() + 1;
    }

    const end = new Date();
    end.setDate(end.getDate() + daysInAdvance);
    end.setHours(24);

    if (
      !(
        this.state.selectedSubject ||
        this.state.selectedYear ||
        this.state.selectedMajor ||
        this.state.selectedUniversity
      )
    ) {
      this.setState({
        tutors: [],
        loading: false
      });
      return;
    }

    let tutorRef = firebase.db
      .collection("tutors")
      .where("available", "==", true);
    console.log("load");

    if (this.state.selectedSubject) {
      const prefs = ["elementaryPref", "middlePref", "highPref"];
      const clientPref = prefs[parseInt(this.context.userDetails.educationID)];
      tutorRef = tutorRef.where(
        clientPref,
        "array-contains",
        this.state.selectedSubject.toString()
      );
    }

    if (this.state.selectedUniversity) {
      tutorRef = tutorRef.where(
        "universityID",
        "==",
        this.state.selectedUniversity
      );
    }

    if (this.state.selectedMajor) {
      tutorRef = tutorRef.where("majorID", "==", this.state.selectedMajor);
    }

    if (this.state.year) {
      tutorRef = tutorRef.where("year", "==", this.state.selectedYear);
    }

    const tutorSnap = await tutorRef.get();

    let tutors = [];

    tutorSnap.docs.forEach(async d => {
      const timeSlotRef = firebase.db
        .collection("tutors")
        .doc(d.id)
        .collection("opentimeslots");
      const timeSlotSnap = await timeSlotRef.get();
      const timeSlots = timeSlotSnap.docs.map(t => {
        const ts = t.data();
        return {
          start: ts.start.toDate(),
          end: ts.end.toDate()
        };
      });
      let slots = this.hourSlots(timeSlots);

      const sessionRef = firebase.db
        .collection("sessions")
        .where("start", ">", now)
        .where("start", "<", end);
      const sessionsSnap = await sessionRef.get();
      const sessions = sessionsSnap.docs.map(t => {
        const ts = t.data();
        return {
          start: ts.start.toDate(),
          end: ts.end.toDate()
        };
      });

      sessions.forEach(s => {
        slots = slots.filter(
          slot => slot.start.getHours() !== s.start.getHours()
        );
      });

      const tutor = d.data();

      tutors.push({
        id: d.id,
        ...tutor,
        availabilityScore: 0.8 * sessions.length + 0.2 * tutor.rating
      });

      if (tutors.length === tutorSnap.docs.length) {
        this.setState({
          tutors,
          loading: false
        });
      }
    });
  }

  filterLoadedTutors() {
    let tutors = this.state.tutors;
    console.log(tutors);

    if (this.state.selectedMajor) {
      tutors = tutors.filter(t => t.majorID === this.state.selectedMajor);
    }

    if (this.state.selectedYear) {
      tutors = tutors.filter(t => t.year === this.state.selectedYear);
    }

    if (this.state.selectedUniversity) {
      tutors = tutors.filter(
        t => t.universityID === this.state.selectedUniversity
      );
    }

    if (this.state.selectedSubject) {
      tutors = tutors.filter(t => {
        const prefs = ["elementaryPref", "middlePref", "highPref"];
        const clientPref =
          prefs[parseInt(this.context.userDetails.educationID)];
        if (!t[clientPref]) {
          return false;
        } else {
          return (
            t[clientPref].filter(s => s === this.state.selectedSubject).length >
            0
          );
        }
      });
    }

    return tutors;
  }

  handleChange(e, data) {
    this.setState({
      [data.name]: data.value,
      loading: true,
      newChanges: true
    });
  }

  render() {
    let majorOptions = [];

    if (!this.state.majors) {
      this.loadMajors();
    } else {
      majorOptions = this.state.majors.map(m => {
        return {
          key: m.id,
          text: m.title,
          value: m.id,
          name: "selectedMajor"
        };
      });
    }

    let universityOptions = [];

    if (!this.state.universities) {
      this.loadUniversities();
    } else {
      universityOptions = this.state.universities.map(u => {
        return {
          key: u.id,
          text: u.title,
          value: u.id,
          name: "selectedUniversity"
        };
      });
    }

    let subjectOptions = [];

    if (!this.state.subjects) {
      this.loadSubjects();
    } else {
      subjectOptions = this.state.subjects.map(s => {
        return {
          key: s.id,
          text: s.title,
          value: s.id,
          name: "selectedSubject"
        };
      });
    }

    const now = new Date();

    let additions = [];

    if (now.getMonth() > 4) {
      additions = [1, 2, 3, 4];
    } else {
      additions = [0, 1, 2, 3];
    }

    const yearOptions = additions.map(a => {
      const year = now.getFullYear() + a;
      return {
        key: a,
        text: year,
        value: year,
        name: "selectedYear"
      };
    });

    let tutors = [];

    if (this.state.newChanges) {
      this.loadTutors();
      this.setState({
        newChanges: false
      });
    }

    console.log(this.state.tutors);

    if (this.state.tutors) {
      tutors = this.state.tutors.sort(
        (a, b) => b.availabilityScore - a.availabilityScore
      );
    }

    return (
      <div style={{ width: "100%" }}>
        <Row>
          <div style={{ width: "10%", marginRight: 15 }}>
            <Tiny>Subject</Tiny>
            <GrayLine width="100%">
              <Dropdown
                style={{ width: "100%" }}
                placeholder="Subject"
                clearable
                name="selectedSubject"
                options={subjectOptions}
                onChange={this.handleChange}
              />
            </GrayLine>
          </div>
          <div style={{ width: "12%", marginRight: 15 }}>
            <Tiny>Major</Tiny>
            <GrayLine width="100%">
              <Dropdown
                style={{ width: "100%" }}
                placeholder="Major"
                name="selectedMajor"
                options={majorOptions}
                clearable
                onChange={this.handleChange}
              />
            </GrayLine>
          </div>
          <div style={{ width: "18%", marginRight: 15 }}>
            <Tiny>University</Tiny>
            <GrayLine width="100%">
              <Dropdown
                style={{ width: "100%" }}
                placeholder="University"
                name="selectedUniversity"
                options={universityOptions}
                clearable
                onChange={this.handleChange}
              />
            </GrayLine>
          </div>
          <div style={{ width: "7%" }}>
            <Tiny>Year</Tiny>
            <GrayLine width="100%">
              <Dropdown
                style={{ width: "100%" }}
                name="selectedYear"
                placeholder="Year"
                options={yearOptions}
                clearable
                onChange={this.handleChange}
              />
            </GrayLine>
          </div>
        </Row>
        {!this.state.loading && (
          <Scroll>
            {tutors.map(t => (
              <ScheduleSession
                favorite={false}
                bio
                major={majorOptions.filter(m => m.value === t.majorID)[0].title}
                university={
                  universityOptions.filter(m => m.value === t.universityID)[0]
                    .title
                }
                tutor={t}
                client={this.context.userDetails}
                toggleFavorite={() => {}}
              />
            ))}
          </Scroll>
        )}
        {this.state.loading && <Loader active>Loading</Loader>}
      </div>
    );
  }
}

const Scroll = styled.div`
  overflow-x: scroll;

  display: flex;
  flex-direction: row;
  padding: 2% 0px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const GrayLine = styled.div`
  padding: 8px 12px;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3em;

  ${props =>
    props.width &&
    `
    width: ${props.width};`}
`;

export default SearchTutors;
