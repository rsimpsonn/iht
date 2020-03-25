import React, { useContext } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import CardSection from "./CardSection";

import userContext from "../contexts/userContext";

import firebase from "../firebase";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const context = useContext(userContext);

  const handleSubmit = async event => {
    console.log("h");
    event.preventDefault();

    const secretRef = await firebase.db
      .collection("stripe_customers")
      .doc(context.user.uid)
      .collection("intents")
      .add({ fulfilled: false });

    secretRef.onSnapshot(async doc => {
      const { fulfilled, secret } = doc.data();

      console.log(doc.data());

      if (fulfilled) {
        if (!stripe || !elements) {
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        }

        const result = await stripe.confirmCardSetup(secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "Jenny Rosen"
            }
          }
        });

        console.log(result);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardSection />
      <button type="submit" disabled={!stripe}>
        Confirm order
      </button>
    </form>
  );
}
