import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { Loader, Tab, Dropdown } from "semantic-ui-react";

import userContext from "../contexts/userContext";
import firebase from "../firebase";
import { generateToken } from "../generateToken";

import axios from "axios";

import MediaCapturer from "react-multimedia-capture";

import {
  SmallButton,
  ButtonText,
  Header,
  SubHeader,
  Small,
  Tiny
} from "../styles";

import Video from "twilio-video";

import Dropzone from "react-dropzone";
import { PDFReader } from "reactjs-pdf-reader";

const imageType = {
  "image/jpeg": "jpg",
  "application/pdf": "pdf",
  "image/png": "png"
};

const rejectOptions = [
  {
    key: 1,
    value: 1,
    text: "Inadequate tutoring"
  },
  {
    key: 0,
    value: 0,
    text: "Other circumstances"
  }
];

class Session extends Component {
  constructor(props) {
    super(props);

    this.joinRoom = this.joinRoom.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.participantConnected = this.participantConnected.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.storeFile = this.storeFile.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
    this.handleGranted = this.handleGranted.bind(this);
    this.handleDenied = this.handleDenied.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleResume = this.handleResume.bind(this);
    this.handleStreamClose = this.handleStreamClose.bind(this);
    this.setStreamToVideo = this.setStreamToVideo.bind(this);
    this.releaseStreamFromVideo = this.releaseStreamFromVideo.bind(this);
    this.downloadVideo = this.downloadVideo.bind(this);
    this.rejectTutor = this.rejectTutor.bind(this);
    this.verifyTutor = this.verifyTutor.bind(this);
  }
  static contextType = userContext;

  state = {
    loading: true,
    open: false,
    client: {},
    tutor: {},
    recording: false,
    paused: false,
    granted: false
  };

  async componentDidMount() {
    const sessionId = this.getSessionId();

    const sessionRef = firebase.db.collection("sessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();
    const sessionData = sessionDoc.data();

    let open = false;

    if (this.context.isTutor) {
      open = this.context.user.uid === sessionData.tutor;
    } else {
      open = this.context.user.uid === sessionData.client;
    }

    const now = new Date();
    const openAt = sessionData.start.toDate();
    openAt.setMinutes(openAt.getMinutes() - 5);

    open = now.getTime() > openAt.getTime();

    const endAt = sessionData.end.toDate();

    open = now.getTime() < endAt.getTime();

    const token = generateToken(this.context.user.uid, sessionId);

    this.setState({
      sessionId: this.getSessionId(),
      session: sessionData,
      sharedDocuments: [],
      open,
      loading: false,
      token,
      previewTracks: null,
      localMediaAvailable: false,
      remoteMediaAvailable: false,
      hasJoinedRoom: false,
      activeRoom: null
    });

    const clientRef = firebase.db.collection("clients").doc(sessionData.client);
    const clientDoc = await clientRef.get();
    const client = clientDoc.data();

    const tutorRef = firebase.db.collection("tutors").doc(sessionData.tutor);
    const tutorDoc = await tutorRef.get();
    const tutor = tutorDoc.data();

    firebase.db
      .collection("sessions")
      .doc(sessionId)
      .collection("sharedDocuments")
      .onSnapshot(snapshot =>
        this.setState({ sharedDocuments: snapshot.docs.map(d => d.data()) })
      );

    this.setState({
      client,
      tutor
    });
  }

  componentWillUnmount() {
    this.leaveRoom();
    this.disconnect();
  }

  getSessionId() {
    const params = new URLSearchParams(this.props.location.search);
    return params.get("s");
  }

  disconnect() {
    if (this.state.previewTracks) {
      this.state.previewTracks.forEach(track => {
        track.stop();
      });
    }
    this.state.activeRoom = null;
    this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
  }

  joinRoom() {
    let connectOptions = {
      name: this.state.sessionId
    };

    if (this.state.previewTracks) {
      connectOptions.tracks = this.state.previewTracks;
    }

    Video.connect(this.state.token, connectOptions).then(
      this.roomJoined,
      error => {
        alert("Could not connect to Twilio: " + error.message);
      }
    );
  }

  attachTracks(tracks, container) {
    console.log(tracks);
    tracks.forEach(track => {
      console.log(track);
      container.appendChild(track.attach());
    });
  }

  attachParticipantTracks(participant, container) {
    var tracks = Array.from(participant.tracks.values());
    this.attachTracks(tracks.map(t => t.track), container);
  }

  leaveRoom() {
    if (this.state.activeRoom == null) return;
    this.state.activeRoom.disconnect();
  }

  storeFile(acceptedFiles) {
    acceptedFiles.forEach(async acceptedFile => {
      console.log(acceptedFile);
      const storageRef = firebase.storage.ref();

      const mainFile = storageRef.child(acceptedFile.name);

      const data = await mainFile.put(acceptedFile);

      const url = await mainFile.getDownloadURL();

      firebase.db
        .collection("sessions")
        .doc(this.state.sessionId)
        .collection("sharedDocuments")
        .add({
          from: this.context.user.uid,
          url,
          name: acceptedFile.name,
          type: imageType[acceptedFile.type],
          addedAt: new Date()
        });
    });
  }

  verifyTutor() {
    firebase.db
      .collection("sessions")
      .doc(`interview${this.state.session.tutor}`)
      .set(
        {
          completed: true,
          verified: true
        },
        {
          merge: true
        }
      );

    firebase.db
      .collection("tutors")
      .doc(this.state.session.tutor)
      .set(
        {
          verifiedInterview: true
        },
        {
          merge: true
        }
      );
  }

  rejectTutor() {
    firebase.db
      .collection("sessions")
      .doc(`interview${this.state.session.tutor}`)
      .set(
        {
          completed: true,
          verified: false
        },
        {
          merge: true
        }
      );

    firebase.db
      .collection("tutors")
      .doc(this.state.session.tutor)
      .set(
        {
          interviewDeclined: this.state.reason
        },
        {
          merge: true
        }
      );
  }

  participantConnected(participant, previewContainer) {
    if (!this.state.remoteMediaAvailable) {
      this.setState({
        remoteMediaAvailable: true
      });
    }
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        this.attachTrack([publication.track], previewContainer); // will never get called
      } else {
        console.log("not subscribed to: ", publication.trackName);
      }
      publication.on("subscribed", track =>
        this.attachTracks([track], previewContainer)
      );
      publication.on("unsubscribed", track => console.log("unsubscribed"));
    });
    console.log(
      `Participant "${participant.identity}" has connected to the Room`
    );
  }

  roomJoined(room) {
    console.log("Joined as '" + this.state.identity + "'");
    this.setState({
      activeRoom: room,
      localMediaAvailable: true,
      hasJoinedRoom: true
    });

    var previewContainer = this.refs.localMedia;
    console.log(previewContainer);
    var remoteContainer = this.refs.remoteMedia;

    if (!previewContainer.querySelector("video")) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }

    if (!previewContainer.querySelector("video")) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }

    room.participants.forEach(participant => {
      this.participantConnected(participant, remoteContainer);
    });

    room.once("participantConnected", participant =>
      this.participantConnected(participant, remoteContainer)
    );

    room.once("participantDisconnected", participant =>
      console.log("disconnected")
    );

    room.on("disconnected", () => {
      this.leaveRoom();
      this.disconnect();
    });
  }

  handleRequest() {
    console.log("Request Recording...");
  }
  handleGranted() {
    this.setState({ granted: true });
    console.log("Permission Granted!");
  }
  handleDenied(err) {
    this.setState({ rejectedReason: err.name });
    console.log("Permission Denied!", err);
  }
  handleStart(stream) {
    this.setState({
      recording: true
    });

    this.setStreamToVideo(stream);
    console.log("Recording Started.");
  }
  handleStop(blob) {
    this.setState({
      recording: false
    });

    this.releaseStreamFromVideo();

    console.log("Recording Stopped.");
    this.downloadVideo(blob);
  }
  handlePause() {
    this.releaseStreamFromVideo();

    this.setState({
      paused: true
    });
  }
  handleResume(stream) {
    this.setStreamToVideo(stream);

    this.setState({
      paused: false
    });
  }
  handleError(err) {
    console.log(err);
  }
  handleStreamClose() {
    this.setState({
      granted: false
    });
  }
  setStreamToVideo(stream) {
    console.log(this.refs.testMedia);
    if (this.refs.testMedia.srcObject) {
      this.refs.testMedia.srcObject = stream;
    } else {
      this.refs.testMedia.src = stream;
    }
  }
  releaseStreamFromVideo() {
    this.refs.testMedia.srcObject = null;
  }
  downloadVideo(blob) {
    axios.post();
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);

    a.click();
  }

  render() {
    if (this.state.loading) {
      return <Loader active>Loading Session</Loader>;
    }

    if (!this.state.hasJoinedRoom) {
      return (
        <SmallButton
          onClick={this.joinRoom}
          style={{
            width: "20%",
            position: "absolute",
            top: "40%",
            right: "40%"
          }}
        >
          <ButtonText>Join Session</ButtonText>
        </SmallButton>
      );
    }

    if (!this.state.open) {
      return <p>You are not authorized to access this tutoring session</p>;
    }

    const documents = this.state.sharedDocuments
      .sort(
        (a, b) => a.addedAt.toDate().getTime() - b.addedAt.toDate().getTime()
      )
      .map(d => {
        return {
          menuItem: d.name.substring(0, 5) + "...",
          render: () => {
            switch (d.type) {
              case "pdf":
                return (
                  <Scroll>
                    <PDFReader showAllPage width={550} url={d.url} />
                  </Scroll>
                );
              default:
                return (
                  <Scroll>
                    <img style={{ width: 550 }} src={d.url} />
                  </Scroll>
                );
            }
          }
        };
      });

    documents.push({
      menuItem: "Add Document",
      render: () => (
        <Dropzone onDrop={this.storeFile}>
          {({ getRootProps, getInputProps }) => (
            <div>
              <div
                style={{
                  width: 500,
                  height: 550,
                  backgroundColor: "#EFEFEF",
                  margin: 10,
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                  alignItems: "center"
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <Small>Drag and drop a file, or click to select files</Small>
              </div>
            </div>
          )}
        </Dropzone>
      )
    });

    const granted = this.state.granted;
    const paused = this.state.paused;
    const recording = this.state.recording;

    return (
      <div>
        <MediaCapturer
          constraints={{ audio: true, video: true }}
          timeSlice={10}
          onRequestPermission={this.handleRequest}
          onGranted={this.handleGranted}
          onDenied={this.handleDenied}
          onStart={this.handleStart}
          onStop={this.handleStop}
          onPause={this.handlePause}
          onResume={this.handleResume}
          onError={this.handleError}
          onStreamClosed={this.handleStreamClose}
          render={({ request, start, stop, pause, resume }) => (
            <div>
              <p>Granted: {granted.toString()}</p>
              <p>Recording: {recording.toString()}</p>
              <p>Paused: {paused.toString()}</p>

              {!granted && <button onClick={request}>Get Permission</button>}
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
              <button onClick={pause}>Pause</button>
              <button onClick={resume}>Resume</button>
            </div>
          )}
        />
        <p>Streaming test</p>
        <video ref="testMedia" autoPlay />
        {this.state.session.interview && !this.context.isTutor && (
          <div>
            <SmallButton onClick={this.verifyTutor}>
              <ButtonText>Verify Tutor</ButtonText>
            </SmallButton>
            <Dropdown
              options={rejectOptions}
              placeholder="Reason"
              onChange={(e, data) => this.setState({ reason: data.value })}
            />
            <SmallButton onClick={this.rejectTutor}>
              <ButtonText>Reject Tutor</ButtonText>
            </SmallButton>
          </div>
        )}
        <SmallButton
          style={{ position: "absolute", bottom: 10, left: 10 }}
          onClick={this.leaveRoom}
        >
          <ButtonText>Leave Session</ButtonText>
        </SmallButton>
        <Row>
          <RightColumn>
            <Tab menu={{ secondary: true, pointing: true }} panes={documents} />
            <Bar>
              <Col>
                {this.state.localMediaAvailable && (
                  <SubHeader>
                    {this.context.isTutor
                      ? this.state.tutor.firstName
                      : this.state.client.firstName}
                  </SubHeader>
                )}
                <VideoContainer ref="localMedia" />
              </Col>
              <Col>
                {this.state.remoteMediaAvailable && (
                  <SubHeader>
                    {this.context.isTutor
                      ? this.state.client.firstName
                      : this.state.tutor.firstName}
                  </SubHeader>
                )}
                <VideoContainer ref="remoteMedia" />
              </Col>
            </Bar>
          </RightColumn>
        </Row>
      </div>
    );
  }
}

const VideoContainer = styled.div`
  height: 180px;
  justify-content: start;
  display: flex;
  margin: 10px;

  > video {
    width: 240px;
    height: 180px;
  }
`;

const Scroll = styled.div`
  height: 600px;
  overflow-y: scroll;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1%;
`;

const End = styled.div`
  display: flex;
  justify-content: end;
`;

const Bar = styled.div`
  display: flex;
  justify-content: end;
  align-items: end;
  flex-direction: row;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
  min-width: 400px;
`;

const Col = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

export default withRouter(Session);
