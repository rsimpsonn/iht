import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Divider, Accordion, Icon, Loader, Popup } from "semantic-ui-react";
import { withRouter } from "react-router-dom";

import { Tiny, Small, SubHeader, SmallButton, ButtonText } from "../styles";

import {
  AiOutlineCheckCircle,
  AiOutlineBorder,
  AiOutlineCloseCircle
} from "react-icons/ai";
import Dropzone from "react-dropzone";

import firebase from "../firebase";
import AvailableTimes from "./AvailableTimes";

import userDetailsContext from "../contexts/userDetailsContext";

import { smallDayMonthDateFullTime } from "../timeFormatter";

const adminTutor = "mPfGJWoPfRX22ceEcIElq9MO7Kk1";
const adminClient = "npKaZDVQchS58KuhHmS0YOkSyPp1";

function Checklist(props) {
  const [profileBioOpen, setProfileBio] = useState(false);
  const [idOpen, setId] = useState(false);
  const [bankOpen, setBank] = useState(false);
  const [verification, setVerification] = useState(false);
  const [file, setFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState(false);
  const [interviewOpen, toggleInterview] = useState(false);
  const [selectedTime, setTime] = useState(false);

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

  async function handleInterview() {
    setLoading(true);

    if (!selectedTime) {
      alert("Please select an interview time");
    }

    const session = await firebase.db
      .collection("sessions")
      .doc(`interview${context.userDetails.id}`)
      .set({
        start: selectedTime.start,
        end: selectedTime.end,
        client: adminClient,
        tutor: context.userDetails.id,
        status: "Upcoming",
        subjectID: "99"
      });

    getInterview();
  }

  async function getInterview() {
    const docRef = firebase.db
      .collection("sessions")
      .doc(`interview${context.userDetails.id}`);
    const doc = await docRef.get();

    if (doc.exists) {
      setInterview({ exists: true, ...doc.data() });
      setLoading(false);
    } else {
      setInterview({ exists: false });
      setLoading(false);
    }
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

  if (!interview) {
    getInterview();
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
      {interview && (
        <div>
          <Divider />
          <Accordion>
            <Accordion.Title
              active={interviewOpen}
              index={0}
              onClick={() => toggleInterview(!interviewOpen)}
            >
              {interview.exists && interview.completed ? (
                interview.verified ? (
                  <AiOutlineCheckCircle
                    color="#09AA82"
                    style={{ marginRight: 10 }}
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
              Complete a 5-minute interview.
            </Accordion.Title>
            <Accordion.Content active={interviewOpen}>
              <Small>
                To tutor on ivybase, you must complete a brief interview. During
                the interview, you will be asked to tutor your interviewer
                through a short practice problem in a subject of your choice.
              </Small>
              {!interview.exists && (
                <div>
                  <Divider />
                  <Popup
                    trigger={
                      <SmallButton
                        style={{ width: "18%", margin: 0, marginBottom: 10 }}
                      >
                        <ButtonText>
                          {selectedTime
                            ? smallDayMonthDateFullTime(
                                selectedTime.start,
                                selectedTime.end
                              )
                            : "Choose Interview Time"}
                        </ButtonText>
                      </SmallButton>
                    }
                    hoverable
                    position="bottom center"
                    fluid
                    flowing
                  >
                    <AvailableTimes
                      tutor={{ id: adminTutor }}
                      minutes={10}
                      delay={24}
                      callback={ts => setTime(ts)}
                      selected={
                        selectedTime ? selectedTime.start.getTime() : false
                      }
                      daysInAdvance={7}
                      wide
                    />
                  </Popup>
                  {selectedTime && (
                    <SmallButton
                      onClick={handleInterview}
                      style={{ width: "18%", margin: 0 }}
                    >
                      <ButtonText>Confirm Interview</ButtonText>
                    </SmallButton>
                  )}
                </div>
              )}
              {interview.exists && interview.verified && (
                <GrayLine style={{ marginTop: 20 }}>
                  <Small>You have successfully completed your interview.</Small>
                </GrayLine>
              )}
              {interview.exists && interview.completed && !interview.verified && (
                <GrayLine style={{ marginTop: 20 }}>
                  <Small>
                    Thank you for interviewing, but unfortunately, we cannot
                    accept you as an ivybase tutor at this time.
                  </Small>
                </GrayLine>
              )}
              {interview.exists && !interview.completed && (
                <GrayLine style={{ marginTop: 20 }}>
                  <Small>
                    Your interview has been scheduled. Details are visible on
                    your Upcoming Sessions panel. The interview room will open
                    five minutes in advance of your start time on your
                    dashboard.
                  </Small>
                </GrayLine>
              )}
            </Accordion.Content>
          </Accordion>
        </div>
      )}
      <Divider />
      <Accordion>
        <Accordion.Title
          active={bankOpen}
          index={0}
          onClick={() => setBank(!bankOpen)}
        >
          <Icon name="dropdown" />
          Set up routing account so that you can receive payment.
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
