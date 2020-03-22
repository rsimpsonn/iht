import React, { Component } from "react";
import { AiOutlineBell } from "react-icons/ai";
import { Popup, List } from "semantic-ui-react";
import styled from "styled-components";
import Alert from "./Alert";

import firebase from "../firebase";

import userContext from "../contexts/userContext";

class Alerts extends Component {
  state = {
    alerts: []
  };

  static contextType = userContext;

  componentDidMount() {
    let earliest = new Date();
    earliest.setDate(earliest.getDate() - 7);
    firebase.db
      .collection("alerts")
      .where("to", "==", this.context.user.uid)
      .where("time", ">", earliest)
      .onSnapshot(querySnapshot =>
        this.setState({
          alerts: querySnapshot.docs.map(d => {
            return { ...d.data(), id: d.id, time: d.data().time.toDate() };
          })
        })
      );
  }

  render() {
    const unread = this.state.alerts.filter(a => !a.read).length;
    return (
      <Popup
        trigger={
          <Icon>
            {unread !== 0 && (
              <Circle>
                <CircleText>{unread}</CircleText>
              </Circle>
            )}
            <AiOutlineBell size={30} />
            <ListItem bold>Alerts</ListItem>
          </Icon>
        }
        flowing
        hoverable
        position="bottom center"
      >
        <List>
          {this.state.alerts.map(alert => (
            <List.Item>
              <Alert alert={alert} />
            </List.Item>
          ))}
        </List>
      </Popup>
    );
  }
}

const ListItem = styled.p`
  font-size: 15px;
  font-family: Lato;
  cursor: pointer;

  ${props =>
    props.bold &&
    `
    font-weight: Bold;
    `}
`;

const Icon = styled.div`
  margin: 0 10px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Circle = styled.div`
  background-color: #ff8989;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CircleText = styled.p`
  font-family: Lato;
  font-weight: Bold;
  color: white;
  font-size: 15px;
`;

export default Alerts;
