import React, { Component } from "react";
import { AiOutlineBell } from "react-icons/ai";
import { Popup } from "semantic-ui-react";
import styled from "styled-components";

class Alerts extends Component {
  render() {
    return (
      <Popup
        trigger={
          <Icon>
            <AiOutlineBell size={30} />
            <ListItem bold>Alerts</ListItem>
          </Icon>
        }
        flowing
        hoverable
        position="bottom center"
      />
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

export default Alerts;
