import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import userContext from "../contexts/userContext";

function Toolbar() {
  return (
    <userContext.Consumer>
      {context => (
        <Menu>
          <Header>
            <StyledLink to="/">Ivy Home Tutors</StyledLink>
          </Header>
          <Bar>
            {context.user == null && (
              <Header>
                <StyledLink to="/signin">Sign In</StyledLink>
              </Header>
            )}
            {context.user != null && (
              <Header>
                <StyledLink to="/dashboard">Dashboard</StyledLink>
              </Header>
            )}
          </Bar>
        </Menu>
      )}
    </userContext.Consumer>
  );
}

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const Header = styled.p`
  font-size: 20px;
  font-family: Lato;
  font-weight: Bold;
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

export default Toolbar;
