import React, { useContext, useState } from "react";
import styled from "styled-components";

import { AiOutlineCheckCircle, AiOutlineFlag } from "react-icons/ai";
import { Divider } from "semantic-ui-react";
import { withRouter } from "react-router-dom";
import axios from "axios";

import { Small, Tiny, SubHeader, SmallButton, ButtonText } from "../styles";

import userContext from "../contexts/userContext";

function CheckCreditCard(props) {
  const context = useContext(userContext);
  const [checkedCard, setChecked] = useState(false);

  async function getMethods() {
    const stripeCustomer = await axios.get(
      "https://us-central1-ivyhometutors.cloudfunctions.net/app/getPaymentMethods",
      {
        params: {
          id: context.user.uid
        }
      }
    );

    if (stripeCustomer.data.data.length > 0) {
      setChecked({ valid: true });
    } else {
      setChecked({ valid: false });
    }
  }

  console.log(checkedCard);

  if (!checkedCard) {
    getMethods();
  }

  if (!checkedCard || checkedCard.valid) {
    return <div />;
  }

  return (
    <Box>
      <SubHeader margin>
        <AiOutlineFlag style={{ marginRight: 10 }} color="#FF8989" size={20} />
        Our records indicate that you do not have a credit/debit card on file
      </SubHeader>
      <Small margin>
        Please add a credit/debit card on your Settings page before requesting
        tutoring sessions.
      </Small>
      <Divider />
      <SmallButton
        style={{ width: 220, margin: 0 }}
        onClick={() => props.history.push("/settings")}
      >
        <ButtonText>Add a Card</ButtonText>
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

export default withRouter(CheckCreditCard);
