import React, { useContext, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import { ButtonText, SmallButton, Tiny } from "../styles";
import { Divider, Loader } from "semantic-ui-react";

import CardSection from "./CardSection";

import userContext from "../contexts/userContext";

import firebase from "../firebase";

export default function CheckoutForm(props) {
  const stripe = useStripe();
  const elements = useElements();
  const context = useContext(userContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();

    setLoading(true);

    const secretRef = await firebase.db
      .collection("stripe_customers")
      .doc(context.user.uid)
      .collection("intents")
      .add({ fulfilled: false });

    secretRef.onSnapshot(async doc => {
      const { fulfilled, secret } = doc.data();

      if (fulfilled) {
        if (!stripe || !elements) {
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        }

        const result = await stripe.confirmCardSetup(secret, {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        });

        props.callback();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Loader active={loading}>Saving card</Loader>
      <Tiny margin>New Card Details</Tiny>
      <CardElement options={{ style: { base: { fontFamily: "Lato" } } }} />
      <Divider />
      <SmallButton type="submit">
        <ButtonText>Save Card</ButtonText>
      </SmallButton>
      <Tiny
        style={{ textAlign: "Center", cursor: "pointer", marginTop: 10 }}
        onClick={props.cancel}
      >
        Cancel
      </Tiny>
    </form>
  );
}
