import React, { Component } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import firebase from "../firebase";

import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe("pk_test_bU6fic7evc6iCPcQUF12bSio00NCEObVIb");

class CreditCard extends Component {
  async componentDidMount() {
    /*const stripeCustomerCall = firebase.functions.httpsCallable(
      "getStripeCustomer"
    );
    const stripeCustomer = await stripeCustomerCall();
    console.log(stripeCustomer);*/
  }

  render() {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    );
  }
}

export default CreditCard;
