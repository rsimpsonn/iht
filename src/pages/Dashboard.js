import React from "react";

import userContext from "../contexts/userContext";

import TutorDashboard from "./TutorDashboard";
import ClientDashboard from "./ClientDashboard";

function Dashboard() {
  return (
    <userContext.Consumer>
      {context => (
        <div>
          {context.isTutor && <TutorDashboard />}
          {!context.isTutor && <ClientDashboard />}
        </div>
      )}
    </userContext.Consumer>
  );
}

export default Dashboard;
