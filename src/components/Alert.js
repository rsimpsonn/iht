import React from "react";
import styled from "styled-components";

import { withRouter } from "react-router-dom";

const abbreviations = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

function Alert(props) {
  const alert = props.alert;
  console.log(alert);

  let action = false;

  if (!alert.actionType) {
    switch (alert.actionType) {
      case "link":
        action = () => {
          props.history.push(alert.url);
        };
    }
  }

  return (
    <div>
      <p>
        {!alert.read && <Circle />} {alert.message}
      </p>
      {action && <p onClick={action}>{alert.actionText}</p>}
      <p>
        {abbreviations[alert.time.getDay()]} {alert.time.getMonth()}/
        {alert.time.getDate()},{" "}
        {alert.time.getHours() % 12 === 0 ? 12 : alert.time.getHours() % 12}:
        {alert.time.getMinutes()}
      </p>
    </div>
  );
}

const Circle = styled.div`
  background-color: blue;
  border-radius: 50%;
  width: 20px;
  height: 20px;
`;

export default withRouter(Alert);
