import React, { useContext } from "react";
import styled from "styled-components";

import { AiOutlineCheckCircle, AiOutlineFlag } from "react-icons/ai";
import { Divider } from "semantic-ui-react";
import { withRouter } from "react-router-dom";

import { Small, Tiny, SubHeader, SmallButton, ButtonText } from "../styles";

import userDetailsContext from "../contexts/userDetailsContext";

function ConfirmAvailability(props) {
  const context = useContext(userDetailsContext);

  const now = new Date();

  if (!context.userDetails.firstName) {
    return <div />;
  }

  if (!(now.getDay() > 2 && now.getDay() < 6)) {
    if (!context.userDetails.available) {
      return (
        <Box>
          <Small margin>
            <AiOutlineFlag
              style={{ marginRight: 10 }}
              color="#FF8989"
              size={16}
            />
            Please note that right now, you are an unavailable tutor, meaning
            that you are not visible on clients' dashboards.
            <br />
            To be an available tutor on ivybase, you must confirm your
            availability once each week between Wednesday and Friday.
          </Small>
        </Box>
      );
    }

    return <div />;
  }

  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() - nextMonday.getDay() + 8);
  const monFormatted = `${nextMonday.getMonth() + 1}/${nextMonday.getDate()}`;
  const nextSunday = new Date();
  nextSunday.setDate(nextMonday.getDate() + 6);
  const sunFormatted = `${nextSunday.getMonth() + 1}/${nextSunday.getDate()}`;

  if (context.userDetails.availableNextWeek) {
    return (
      <Box>
        <Small margin>
          <AiOutlineCheckCircle
            style={{ marginRight: 10 }}
            color="#09AA82"
            size={16}
          />
          Your availability has been confirmed for next week, {monFormatted} -{" "}
          {sunFormatted}
        </Small>
      </Box>
    );
  }

  const thisFriday = new Date();
  thisFriday.setDate(thisFriday.getDate() - thisFriday.getDay() + 5);
  const friFormatted = `${thisFriday.getMonth() + 1}/${thisFriday.getDate()}`;

  return (
    <Box>
      <SubHeader margin>
        <AiOutlineFlag color="#FF8989" style={{ marginRight: 10 }} size={16} />
        Please confirm your availability for next week, {monFormatted} -{" "}
        {sunFormatted}, by Friday, {friFormatted}, at 11:59PM EST. <br />
      </SubHeader>
      <Small>
        You must set at least one open time slot from {monFormatted} -{" "}
        {sunFormatted}. If you do not confirm your availability, you will not be
        visible on clients' dashboards. <br />
        Please note that any recurring sessions you have scheduled will not be
        cancelled.
      </Small>
      <Divider />
      <SmallButton
        onClick={() => props.history.push("availability")}
        style={{
          width: 200,
          margin: 0
        }}
      >
        <ButtonText>Set Availability</ButtonText>
      </SmallButton>
    </Box>
  );
}

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  margin: 30px 15px;
  padding: 15px;
`;

export default withRouter(ConfirmAvailability);
