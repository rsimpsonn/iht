import React, { Component } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import ScheduleSession from "./ScheduleSession";

import getTutor from "../tutors";

import userContext from "../contexts/userContext";

class ScheduleSessions extends Component {
  static contextType = userContext;

  state = {
    favorites: [],
    favoritesOpen: false,
    recentsOpen: false,
    searchOpen: false
  };

  componentDidMount() {
    Promise.all(this.props.client.favorites.map(f => getTutor(f))).then(
      favorites => this.setState({ favorites })
    );
  }

  render() {
    console.log(this.state.favorites);
    return (
      <div>
        <Header>Schedule sessions</Header>
        <SubHeader
          cursor="pointer"
          onClick={() =>
            this.setState({ favoritesOpen: !this.state.favoritesOpen })
          }
        >
          Favorite tutors
        </SubHeader>
        {this.state.favoritesOpen && (
          <Bar>
            {this.state.favorites.map(f => (
              <ScheduleSession
                favorite
                bio={false}
                tutor={f}
                client={this.props.client}
              />
            ))}
          </Bar>
        )}
        <SubHeader cursor="pointer">Recent tutors</SubHeader>
        <SubHeader cursor="pointer">Search for tutors</SubHeader>
      </div>
    );
  }
}

const Header = styled.p`
  font-size: 20px;
  font-family: Lato;
  font-weight: Bold;
`;

const SubHeader = styled.p`
  font-size: 15px;
  font-family: Lato;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
`;

export default ScheduleSessions;
