import React from "react";
import styled from "styled-components";

import userContext from "../contexts/userContext";
import alertContext from "../contexts/alertContext";

import TutorDashboard from "./TutorDashboard";
import ClientDashboard from "./ClientDashboard";

function Dashboard() {
  return (
    <userContext.Consumer>
      {userContext => (
        <alertContext.Consumer>
          {alertContext => (
            <div>
              {alertContext.bannerAlert && (
                <AlertBar>
                  <AlertText>{alertContext.bannerAlert.message}</AlertText>
                </AlertBar>
              )}
              {userContext.isTutor && <TutorDashboard />}
              {!(userContext.user === null) && !userContext.isTutor && (
                <ClientDashboard />
              )}
            </div>
          )}
        </alertContext.Consumer>
      )}
    </userContext.Consumer>
  );
}

const AlertText = styled.div`
  font-size: 14px;
  color: white;
  font-family: Lato;
`;

const AlertBar = styled.div`
  padding: 2%;
  color: #09aa82;
  width: 100%;
`;

export default Dashboard;
