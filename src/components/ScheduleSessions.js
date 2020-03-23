import React, { Component } from "react";
import { Tab } from "semantic-ui-react";

import styled from "styled-components";

import firebase from "../firebase";
import ScheduleSession from "./ScheduleSession";

import getTutor from "../tutors";

import userContext from "../contexts/userContext";

import {
  AiOutlineSearch,
  AiOutlineClockCircle,
  AiOutlineStar
} from "react-icons/ai";

import { Header, SubHeader, Small } from "../styles";

class ScheduleSessions extends Component {
  static contextType = userContext;

  state = {
    favorites: [],
    favoritesOpen: false,
    recentsOpen: false,
    searchOpen: false
  };

  async componentDidMount() {
    let favorites = [];

    this.props.client.favorites.forEach(async f => {
      const t = await getTutor(f);
      favorites.push(t);

      if (this.props.client.favorites.length === favorites.length) {
        this.setState({
          favorites
        });
      }
    });
  }

  render() {
    const panes = [
      {
        menuItem: "Favorite Tutors",
        render: () => (
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
        )
      },
      {
        menuItem: "Recent Tutors",
        render: () => (
          <Bar>
            <SubHeader cursor="pointer">Recent tutors</SubHeader>
          </Bar>
        )
      },
      {
        menuItem: "Search for Tutors",
        render: () => (
          <Bar>
            <SubHeader cursor="pointer">Search for tutors</SubHeader>
          </Bar>
        )
      }
    ];
    return (
      <TopMargin>
        <Header>Schedule sessions</Header>
        <Tab
          style={{ margin: "20px 0" }}
          menu={{ secondary: true, pointing: true }}
          panes={panes}
        />
      </TopMargin>
    );
  }
}

const TopMargin = styled.div`
  padding: 20px 0 20px;
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  padding: 2%;
`;

export default ScheduleSessions;
