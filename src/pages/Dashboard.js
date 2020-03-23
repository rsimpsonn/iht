import React from "react";
import styled from "styled-components";

import userContext from "../contexts/userContext";
import alertContext from "../contexts/alertContext";

import TutorDashboard from "./TutorDashboard";
import ClientDashboard from "./ClientDashboard";

import { withRouter } from "react-router-dom";

function Dashboard(props) {
  return (
    <userContext.Consumer>
      {userContext => (
        <div>
          <alertContext.Consumer>
            {alertContext =>
              alertContext.newAlert.banner && (
                <AlertBar>
                  <AlertText>{alertContext.newAlert.message}</AlertText>
                  {alertContext.newAlert.actionType === "link" && (
                    <AlertText
                      link
                      onClick={() =>
                        props.history.push(alertContext.newAlert.url)
                      }
                    >
                      {alertContext.newAlert.actionText}
                    </AlertText>
                  )}
                </AlertBar>
              )
            }
          </alertContext.Consumer>
          <TopMargin>
            {userContext.isTutor && <TutorDashboard />}
            {userContext.user && !userContext.isTutor && <ClientDashboard />}
          </TopMargin>
        </div>
      )}
    </userContext.Consumer>
  );
}

const AlertText = styled.div`
  font-size: 14px;
  color: white;
  font-family: Lato;

  margin: 0 10px 0 0;
  ${props =>
    props.link &&
    `
    font-style: italic;
    cursor: pointer;
    font-weight: Bold;
    `};
`;

const AlertBar = styled.div`
  padding: 12px 2%;
  background-color: #09aa82;
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const TopMargin = styled.div`
  margin: 20px 0 0 0;
  padding: 0 2%;
`;

export default withRouter(Dashboard);
