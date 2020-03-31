import React, { Component } from "react";
import { Tab } from "semantic-ui-react";

import styled from "styled-components";

import firebase from "../firebase";
import ScheduleSession from "./ScheduleSession";
import SearchTutors from "./SearchTutors";

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
    recents: [],
    favoritesOpen: false,
    recentsOpen: false,
    searchOpen: false
  };

  async componentDidMount() {
    let favorites = [];

    if (this.props.client.favorites) {
      this.props.client.favorites.forEach(async f => {
        const t = await getTutor(f);
        favorites.push({ favorite: true, ...t });

        if (this.props.client.favorites.length === favorites.length) {
          this.setState({
            favorites
          });
        }
      });
    }

    const snapshot = await firebase.db
      .collection("sessions")
      .where("status", "==", "Completed")
      .where("client", "==", this.props.client.id)
      .get();

    let recents = [];

    snapshot.docs.forEach(async f => {
      const t = await getTutor(f.data().tutor);
      if (recents.filter(c => c.id === t.id).length === 0) {
        recents.push({
          favorite:
            this.props.client.favorites ||
            this.props.client.favorites.filter(e => e.id === t.id).length === 1,
          ...t
        });
      }

      this.setState({ recents });
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
                favorite={r.favorite}
                bio={false}
                tutor={r}
                client={this.props.client}
                toggleFavorite={() =>
                  this.setState({
                    favorites: this.state.favorites.map(re => {
                      if (re.id === r.id) {
                        return {
                          ...r,
                          favorite: !r.recent
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
            <SearchTutors />
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
