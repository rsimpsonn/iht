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
import PastSession from "./PastSession";
import PastSessioms from "./PastSessions";

class ScheduleSessions extends Component {
  static contextType = userContext;

  state = {
    favorites: [],
    recents:[],
    favoritesOpen: false,
    recentsOpen: false,
    searchOpen: false
  };

  async componentDidMount() {
    let favorites = [];

    this.props.client.favorites.forEach(async f => {
      const t = await getTutor(f);
      favorites.push({ favorite: true, ...t });

      if (this.props.client.favorites.length === favorites.length) {
        this.setState({
          favorites
        });


      }
    });

    const snapshot = await firebase.db.collection("sessions").where("status", "==", "Completed").get();

    const recents = snapshot.docs.map(d => d.data());

    this.setState({
      recents: recents
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
                favorite={f.favorite}
                bio={false}
                tutor={f}
                client={this.props.client}
                toggleFavorite={() =>
                  this.setState({
                    favorites: this.state.favorites.map(fv => {
                      if (fv.id === f.id) {
                        return {
                          ...f,
                          favorite: !f.favorite
                        };
                      } else {
                        return fv;
                      }
                    })
                  })
                }
              />
            ))}
          </Bar>
        )
      },
      {
        menuItem: "Recent Tutors",
        render: () => (
          <Bar>
            {this.state.recents.map(r => (
              <ScheduleSession
                recent={r.recent}
                bio={false}
                tutor={r}
                client={this.props.client}
                toggleRecent={() =>
                  this.setState({
                    recents: this.state.recents.map(re => {
                      if (re.id === r.id) {
                        return {
                          ...r,
                          recent: !r.recent
                        };
                      } else {
                        return re;
                      }
                    })
                  })
                }
              />
            ))}
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

    console.log(this.state.favorites);
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
