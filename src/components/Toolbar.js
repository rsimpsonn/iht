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
import EmailNotVerified from "./EmailNotVerified";
import {
  AiOutlineBell,
  AiOutlineCalendar,
  AiOutlineHome,
  AiOutlineNotification
} from "react-icons/ai";

import fullLogo from "../images/ivybase.png";

function Toolbar(props) {
  return (
    <userContext.Consumer>
      {context => (
        <div>
          <Menu>
            <Logo
              onClick={() => props.history.push("/")}
              src={fullLogo}
              style={{ width: "10%", height: "auto" }}
            />
            {context.user == null && (
              <Bar>
                <ListItem
                  style={{ marginRight: 25 }}
                  bold
                  onClick={() => props.history.push("/fortutors")}
                >
                  For Tutors
                </ListItem>
                <ListItem
                  style={{ marginRight: 25 }}
                  bold
                  onClick={() => props.history.push("/signin")}
                >
                  Sign In
                </ListItem>
                <SignUpButton>
                  <ListItem
                    white
                    bold
                    onClick={() => props.history.push("/signup")}
                    style={{ backgroundColor: "" }}
                  >
                    Sign Up
                  </ListItem>
                </SignUpButton>
              </Bar>
            )}
            {context.user != null && (
              <Bar>
                <Icon onClick={() => props.history.push("/support")}>
                  <AiOutlineNotification style={{ margin: 5 }} size={25} />
                  <ListItem bold>Support</ListItem>
                </Icon>
                <Icon onClick={() => props.history.push("/dashboard")}>
                  <AiOutlineHome style={{ margin: 5 }} size={25} />
                  <ListItem bold>Dashboard</ListItem>
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
                    <ListItem
                      onClick={() => {
                        firebase.auth.signOut();
                        props.history.push("/");
                      }}
                    >
                      Sign Out
                    </ListItem>
                  </Popup>
                </Icon>
              </Bar>
            )}
          </Menu>
          {context.user != null && !context.user.emailVerified && (
            <EmailNotVerified />
          )}
        </div>
      )}
    </userContext.Consumer>
  );
}

const SignUpButton = styled.div`
  background-color: #09aa82;
  padding: 10px;
  border-radius: 6px;
`;

const Logo = styled.img`
  cursor: pointer;
`;

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
  padding: 1.4% 2% 0;
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
  margin: 0px;

  ${props =>
    props.bold &&
    `
    font-weight: Bold;
    `};

  ${props =>
    props.bold &&
    `
      font-weight: Bold;
      `};

  ${props =>
    props.white &&
    `
        color: white;
        `};
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
