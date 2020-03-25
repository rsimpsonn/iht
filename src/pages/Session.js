import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { Loader } from "semantic-ui-react";

import userContext from "../contexts/userContext";
import firebase from "../firebase";
import { generateToken } from "../generateToken";

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
import FileViewer from "react-file-viewer";

class Session extends Component {
  constructor(props) {
    super(props);

    this.joinRoom = this.joinRoom.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.participantConnected = this.participantConnected.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.storeFile = this.storeFile.bind(this);
  }
  static contextType = userContext;

  state = {
    loading: true,
    open: false,
    client: {},
    tutor: {}
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
    this.state.activeRoom.disconnect();
  }

  storeFile(acceptedFiles) {
    acceptedFiles.forEach(async acceptedFile => {
      const storageRef = firebase.storage.ref();

      const mainFile = storageRef.child(acceptedFile.name);

      const data = await mainFile.put(acceptedFile);

      const url = await mainFile.getDownloadURL();

      firebase.db
        .collection("sessions")
        .doc(this.state.sessionId)
        .collection("sharedDocuments")
        .add({ from: this.context.user.uid, url });
    });
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
      console.log("h");
      this.leaveRoom();
      this.disconnect();
    });
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

    return (
      <div>
        <Menu>
          <End>
            <SmallButton onClick={this.leaveRoom}>
              <ButtonText>Leave Session</ButtonText>
            </SmallButton>
          </End>
        </Menu>
        <Dropzone onDrop={this.storeFile}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
        {this.state.sharedDocuments && (
          <FileViewer
            fileType={"jpg"}
            filePath={this.state.sharedDocuments[0].url}
          />
        )}
        {this.state.sharedDocuments.map(d => (
          <p>{d.url}</p>
        ))}
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
  }
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

const Col = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

export default withRouter(Session);
