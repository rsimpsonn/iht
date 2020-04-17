import React, { Component } from "react";
import styled from "styled-components";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader, Divider, Checkbox } from "semantic-ui-react";

import { AiOutlineCreditCard } from "react-icons/ai";
import { Tiny, Small, SmallButton, ButtonText } from "../styles";

import axios from "axios";

import firebase from "../firebase";

import AddCreditCard from "./AddCreditCard";

import userDetailsContext from "../contexts/userDetailsContext";

const stripePromise = loadStripe("pk_test_bU6fic7evc6iCPcQUF12bSio00NCEObVIb");

class CreditCard extends Component {
  constructor(props) {
    super(props);

    this.getStripeCustomer = this.getStripeCustomer.bind(this);
    this.handleDefault = this.handleDefault.bind(this);
  }

  state = {};

  static contextType = userDetailsContext;

  async getStripeCustomer() {
    this.setState({
      loading: true
    });
    const stripeCustomer = await axios.get(
      "https://us-central1-ivyhometutors.cloudfunctions.net/app/getPaymentMethods",
      {
        params: {
          id: this.context.userDetails.id
        }
      }
    );
    const customer = await axios.get(
      "https://us-central1-ivyhometutors.cloudfunctions.net/app/getCustomer",
      {
        params: {
          id: this.context.userDetails.id
        }
      }
    );
    console.log(stripeCustomer);
    console.log(customer);
    this.setState({
      cards: stripeCustomer.data.data,
      customer: customer.data,
      loading: false,
      newCard: false
    });
  }

  handleDefault(e, data) {
    console.log(e.target.name, data);
    this.setState({
      [data.name]: data.value
    });
  }

  render() {
    if (this.state.loading) {
      return <Loader active={true}>Loading Card Information</Loader>;
    }

    if (!this.state.cards) {
      this.getStripeCustomer();
      return <div />;
    }

    if (this.state.newCard) {
      return (
        <Elements stripe={stripePromise}>
          <AddCreditCard
            cancel={() => this.setState({ newCard: false })}
            callback={this.getStripeCustomer}
          />
        </Elements>
      );
    }

    let defaultSource = "";
    if (this.state.cards.length > 0) {
      defaultSource = this.state.defaultSource
        ? this.state.defaultSource
        : this.state.customer.default_source === null
        ? this.state.cards[0].id
        : this.state.customer.default_source;
    }

    const cards = this.state.cards.map(c => (
      <div>
        <Row>
          <Small style={{ display: "flex", alignItems: "center" }}>
            <AiOutlineCreditCard size={16} style={{ marginRight: 10 }} /> ····{" "}
            {c.card.last4}
            &nbsp;&nbsp;
            {c.card.exp_month < 10 ? `0${c.card.exp_month}` : c.card.exp_month}/
            {c.card.exp_year.toString().substring(2)}
          </Small>
          <Checkbox
            style={{ marginRight: 22 }}
            radio
            name="defaultSource"
            value={c.id}
            checked={c.id === defaultSource}
            onChange={this.handleDefault}
          />
        </Row>
        <Divider />
      </div>
    ));

    return (
      <div>
        <Tiny margin>
          Cards <span style={{ float: "right" }}>Default</span>
        </Tiny>
        {cards.length === 0 && <Tiny>No cards</Tiny>}
        {cards}
        <SmallButton onClick={() => this.setState({ newCard: true })}>
          <ButtonText>Add New Card</ButtonText>
        </SmallButton>
      </div>
    );
  }
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default CreditCard;
