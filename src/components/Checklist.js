import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Divider, Accordion, Icon, Loader } from "semantic-ui-react";
import { withRouter } from "react-router-dom";

import { Tiny, Small, SubHeader, SmallButton, ButtonText } from "../styles";

import {
  AiOutlineCheckCircle,
  AiOutlineBorder,
  AiOutlineCloseCircle
} from "react-icons/ai";
import Dropzone from "react-dropzone";

import firebase from "../firebase";

import userDetailsContext from "../contexts/userDetailsContext";

function Checklist(props) {
  const [profileBioOpen, setProfileBio] = useState(false);
  const [idOpen, setId] = useState(false);
  const [bankOpen, setBank] = useState(false);
  const [verification, setVerification] = useState(false);
  const [file, setFile] = useState(false);
  const [loading, setLoading] = useState(false);

  const context = useContext(userDetailsContext);

  if (context.userDetails.verified || !context.userDetails.firstName) {
    return <div />;
  }

  function getEltByBool(bool) {
    return bool ? (
      <AiOutlineCheckCircle
        color="#09AA82"
        style={{ marginRight: 10 }}
        size={16}
      />
    ) : (
      <AiOutlineBorder color="#D8D8D8" style={{ marginRight: 10 }} size={16} />
    );
  }

  function firstAccordionComplete() {
    return (
      context.userDetails.profilePic &&
      context.userDetails.bio &&
      ((context.userDetails.elementaryPref &&
        context.userDetails.elementaryPref.length > 0) ||
        (context.userDetails.middlePref &&
          context.userDetails.middlePref.length > 0) ||
        (context.userDetails.highPref &&
          context.userDetails.highPref.length > 0))
    );
  }

  async function getVerification() {
    const docRef = firebase.db
      .collection("verifications")
      .doc(context.userDetails.id);

    const vDoc = await docRef.get();

    if (vDoc.exists) {
      setVerification({
        exists: true,
        ...vDoc.data()
      });
      setLoading(false);
    } else {
      setVerification({
        exists: false
      });
      setLoading(false);
    }
  }

  function handleFile(acceptedFiles) {
    setFile(acceptedFiles[0]);
  }

  async function submitVerification() {
    setLoading(true);
    const storageRef = firebase.storage.ref();

    const mainFile = storageRef.child(file.name);

    const data = await mainFile.put(file);

    const url = await mainFile.getDownloadURL();

    const doc = await firebase.db
      .collection("verifications")
      .doc(context.userDetails.id)
      .set(
        {
          transcript: url,
          status: "Pending",
          isVerified: false
        },
        { merge: true }
      );
    getVerification();
  }

  const firstCompleted = firstAccordionComplete();

  if (!verification) {
    getVerification();
  }

  return (
    <Box>
      <SubHeader margin>
        Welcome, {context.userDetails.firstName}, follow these steps to get
        started
      </SubHeader>
      <Divider />
      <Accordion>
        <Accordion.Title
          active={profileBioOpen}
          index={0}
          onClick={() => setProfileBio(!profileBioOpen)}
        >
          {firstCompleted && (
            <AiOutlineCheckCircle
              color="#09AA82"
              style={{ marginRight: 10 }}
              size={16}
            />
          )}
          {!firstCompleted && <Icon name="dropdown" />}
          Set a bio, profile picture, and teaching preferences.
        </Accordion.Title>
        <Accordion.Content active={profileBioOpen}>
          <Small margin>{getEltByBool(context.userDetails.bio)} Bio</Small>
          <Small margin>
            {getEltByBool(context.userDetails.profilePic)} Profile picture
          </Small>
          <Tiny style={{ marginLeft: 26 }}>
            Your face must be clearly visible in your profile picture.
            <br />
            Please note that your profile picture cannot be changed without
            contacting customer support.
          </Tiny>
          <Small margin>
            {getEltByBool(
              (context.userDetails.elementaryPref &&
                context.userDetails.elementaryPref.length > 0) ||
                (context.userDetails.middlePref &&
                  context.userDetails.middlePref.length > 0) ||
                (context.userDetails.highPref &&
                  context.userDetails.highPref.length > 0)
            )}
            Preferences
          </Small>
          <Tiny style={{ marginLeft: 26 }}>
            Tutors will only receive requests for subjects that they have
            designated in their subject preferences.
            <br />
            Please input at least one subject preference.
          </Tiny>
          <Divider />
          <SmallButton
            style={{ width: "25%", margin: "20px 0px" }}
            onClick={() => props.history.push("/settings")}
          >
            <ButtonText>Go to Settings</ButtonText>
          </SmallButton>
        </Accordion.Content>
      </Accordion>
      <Divider />
      {verification && (
        <Accordion>
          <Accordion.Title
            active={idOpen}
            index={0}
            onClick={() => setId(!idOpen)}
          >
            {verification.exists && verification.status !== "Pending" ? (
              verification.isVerified ? (
                <AiOutlineCheckCircle
                  color="#09AA82"
                  style={{ margiRight: 10 }}
                  size={16}
                />
              ) : (
                <AiOutlineCloseCircle
                  color="#FF8989"
                  style={{ marginRight: 10 }}
                  size={16}
                />
              )
            ) : (
              <Icon name="dropdown" />
            )}
            Submit an unofficial transcript.
          </Accordion.Title>
          <Accordion.Content active={idOpen}>
            {loading && <Loader active={true}>Loading</Loader>}
          </Accordion.Content>
          {!loading && (
            <Accordion.Content active={idOpen}>
              <Small>
                Your transcript will be used to verify your eligibility to
                become an Ivybase tutor.
              </Small>
              {verification.exists && !verification.isVerified && (
                <GrayLine style={{ marginTop: 20 }}>
                  {verification.status === "Pending" && (
                    <Tiny>
                      Your transcript is being reviewed and will be verified in
                      the next 24-48 hours.
                    </Tiny>
                  )}
                  {verification.status === "Declined" && (
                    <div>
                      <Tiny>
                        Your transcript has been declined for the following
                        reason:
                      </Tiny>
                      <Tiny>{verification.rejectionReason}</Tiny>
                      <Tiny>You may resubmit your transcript.</Tiny>
                    </div>
                  )}
                </GrayLine>
              )}
              {(!verification.exists || verification.status === "Declined") && (
                <div>
                  <Divider />
                  <Dropzone onDrop={handleFile}>
                    {({ getRootProps, getInputProps }) => (
                      <div>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <SmallButton style={{ width: "15%", margin: 0 }}>
                            <ButtonText>Add Transcript</ButtonText>
                          </SmallButton>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                  {file && (
                    <Row>
                      <SmallButton
                        style={{ width: "15%", margin: 0 }}
                        onClick={submitVerification}
                      >
                        <ButtonText>Submit Transcript</ButtonText>
                      </SmallButton>
                      <Tiny style={{ marginLeft: 10 }}>{file.name}</Tiny>
                    </Row>
                  )}
                </div>
              )}
            </Accordion.Content>
          )}
        </Accordion>
      )}
      <Divider />
      <Accordion>
        <Accordion.Title
          active={bankOpen}
          index={0}
          onClick={() => setBank(!bankOpen)}
        >
          <Icon name="dropdown" />
          Set up routing account so that you can receive funds.
        </Accordion.Title>
        <Accordion.Content active={bankOpen}>
          <p>
            A dog is a type of domesticated animal. Known for its loyalty and
            faithfulness, it can be found as a welcome guest in many households
            across the world.
          </p>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
}

const GrayLine = styled.div`
  padding: 8px 12px;
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.3em;

  ${props =>
    props.width &&
    `
    width: ${props.width};`}
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const Box = styled.div`
  box-shadow: 0 0 20px #e9e9e9;
  border-radius: 8px;
  margin: 30px 15px;
  padding: 15px;
`;

export default withRouter(Checklist);
