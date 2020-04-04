import React, { useState, useContext } from "react";
import styled from "styled-components";

import firebase from "../firebase";
import userContext from "../contexts/userContext";

import { Dropdown, Divider } from "semantic-ui-react";

import { AiOutlineCheckCircle } from "react-icons/ai";

import Dropzone from "react-dropzone";

import {
  Header,
  SubHeader,
  Small,
  Tiny,
  ButtonText,
  SmallButton,
  NiceArea
} from "../styles";

function Support() {
  const context = useContext(userContext);
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(false);
  const [message, setMessage] = useState(false);
  const [sent, setSent] = useState(false);

  async function getLabels() {
    const supportLabels = await firebase.db
      .collection("support")
      .doc(context.isTutor ? "tutor" : "client")
      .collection("labels")
      .get();

    setLabels(
      supportLabels.docs.map(l => {
        return { id: parseInt(l.id), ...l.data() };
      })
    );
  }

  const labelOptions = labels
    .sort((a, b) => a.id - b.id)
    .map(l => {
      return {
        key: l.id,
        value: l.id,
        text: l.title
      };
    });

  async function submit(e) {
    e.preventDefault();

    if (!selectedLabel || !message) {
      alert("Please enter a subject and a message");
    }

    const at = new Date();

    const supportRef = await firebase.db
      .collection("support")
      .doc(context.isTutor ? "tutor" : "client")
      .collection("tickets")
      .add({
        label: selectedLabel,
        message,
        from: context.user.uid,
        solved: false,
        at
      });

    console.log(supportRef);

    if (supportRef.id) {
      setSent(true);
    }
  }

  if (labels.length === 0) {
    getLabels();
  }

  return (
    <Form>
      {sent && (
        <Box>
          <Tiny>
            <AiOutlineCheckCircle
              color="#09AA82"
              style={{ marginRight: 10 }}
              size={16}
            />
            Your message has been sent.
          </Tiny>
        </Box>
      )}
      <Header margin>{context.isTutor ? "Tutor" : "Client"} Support</Header>
      <Small>
        Fill out the form below and we will get back to you as soon as possible.
      </Small>
      <form onSubmit={submit}>
        <Dropdown
          placeholder="Subject"
          style={{ margin: "10px 0" }}
          fluid
          selection
          options={labelOptions}
          onChange={(e, data) => setSelectedLabel(data.value)}
        />
        <NicerArea
          placeholder="Message"
          onChange={message => setMessage(message.target.value)}
        />
        <Divider />
        <SmallButton>
          <ButtonText>Send Message</ButtonText>
        </SmallButton>
      </form>
    </Form>
  );
}

const Form = styled.div`
  width: 40%;
  margin: auto;
  margin-top: 80px;
`;

const NicerArea = styled(NiceArea)`
  background-color: white;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3em;
  padding: 15px;
  width: 100%;
  height: 250px;
  font-size: 14px;
  font-weight: Normal;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  padding: 15px;
`;

export default Support;
