import React from "react";
import styled from "styled-components";
import { Header, SmallButton, ButtonText } from "../styles";
import { withRouter } from "react-router-dom";
import landing from "../images/landing.png";
import ivybase from "../images/ivybase.png";
import { useMediaQuery } from "react-responsive";

import WhiteboardScreen from "../components/Whiteboard";

function Landing(props) {
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  return (
    <Row mobile={isPortrait}>
      <Information portrait={isPortrait}>
        <Logo src={ivybase} portrait={isPortrait} />
        <LandingText portrait={isPortrait}>
          Get personalized online tutoring from Ivy League students for $25/hour
        </LandingText>
        <SmallButton
          style={{
            borderRadius: 8,
            width: isPortrait ? "60%" : "28%",
            margin: "50px 0px"
          }}
          color="#07D68A"
          onClick={() => props.history.push("/signup")}
        >
          <Header
            style={{ fontSize: isPortrait ? "3.5vw" : "1.6vw" }}
            color="white"
          >
            Get Started
          </Header>
        </SmallButton>
      </Information>
      <MainImage portrait={isPortrait} src={landing} />
    </Row>
  );
}

const MainImage = styled.img`
  width: 48%;
  margin: 3% 2%;

  ${props =>
    props.portrait &&
    `
  width: 80%;
  `}
`;

const Logo = styled.img`
  width: 45%;
  margin-bottom: 2%;

  ${props =>
    props.portrait &&
    `
    margin-top: 5%;
  width: 40%;
  `}
`;

const Main = styled.div`
  display: flex;
  flex-direction: row;
`;

const Information = styled.div`
  width: 45%;
  margin-top: 5%;

  ${props =>
    props.portrait &&
    `
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    width: 100%;
    `}
`;

const Row = styled.div`
  padding: 0% 6%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${props =>
    props.mobile &&
    `
    flex-direction: column;
    justify-content: center;
    align-items: center;
    `}
`;

const LandingText = styled(Header)`
  font-weight: 900;
  font-size: 4.2vw;
  line-height: 4.5vw;

  ${props =>
    props.portrait &&
    `
    text-align: center;
    margin: 5% 10% 0%;
    font-size: 5.5vw;
    line-height: 6vw;
    `}
`;
export default withRouter(Landing);
