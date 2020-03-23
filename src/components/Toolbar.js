import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import userContext from "../contexts/userContext";
import userDetailsContext from "../contexts/userDetailsContext";
import { Popup } from "semantic-ui-react";

import getTutor from "../tutors.js";
import firebase from "../firebase";

import { withRouter } from "react-router-dom";
import Alerts from "./Alerts";
import User from "./User";

import {
  AiOutlineBell,
  AiOutlineCalendar,
  AiOutlineHome
} from "react-icons/ai";

function Toolbar(props) {
  return (
    <userContext.Consumer>
      {context => (
        <Menu>
          <Header>
            <StyledLink to="/">Ivy Home Tutors</StyledLink>
          </Header>
          {context.user == null && (
            <ListItem bold onClick={() => props.history.push("/signin")}>
              Sign In
            </ListItem>
          )}
          {context.user != null && (
            <Bar>
              <Icon onClick={() => props.history.push("/dashboard")}>
                <AiOutlineHome style={{ margin: 5 }} size={25} />
                <ListItem bold>Dashboard</ListItem>
              </Icon>
              <Icon onClick={() => props.history.push("/calendar")}>
                <AiOutlineCalendar style={{ margin: 5 }} size={25} />
                <ListItem bold>Calendar</ListItem>
              </Icon>
              <Alerts userContext={context} />
              <Icon>
                <Popup
                  trigger={
                    <User isTutor={context.isTutor} id={context.user.uid} />
                  }
                  position="bottom right"
                  flowing
                  hoverable
                >
                  <ListItem onClick={() => props.history.push("/settings")}>
                    Settings
                  </ListItem>
                  {context.isTutor && (
                    <ListItem
                      onClick={() => props.history.push("/availability")}
                    >
                      Set Availability
                    </ListItem>
                  )}
                  <ListItem onClick={() => firebase.auth.signOut()}>
                    Sign Out
                  </ListItem>
                </Popup>
              </Icon>
            </Bar>
          )}
        </Menu>
      )}
    </userContext.Consumer>
  );
}

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Header = styled.p`
  font-size: 20px;
  font-family: Lato;
  font-weight: Bold;
`;

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

const StyledLink = styled(Link)`
  text-decoration: none;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

const Circle = styled.img`
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background-color: black;
`;

const Icon = styled.div`
  margin: 0 10px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export default withRouter(Toolbar);
