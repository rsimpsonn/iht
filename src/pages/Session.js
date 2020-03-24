import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { Loader } from "semantic-ui-react";

import { SubHeader } from "../styles";

import userContext from "../contexts/userContext";
import firebase from "../firebase";
import { generateToken } from "../generateToken";

import Video from "twilio-video";

class Session extends Component {
  constructor(props) {
    super(props);

    this.joinRoom = this.joinRoom.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.participantConnected = this.participantConnected.bind(this);
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

    this.setState({
      client,
      tutor
    });

    this.props.history.listen(location => {
      if (this.state.previewTracks) {
        this.state.previewTracks.forEach(track => {
          track.stop();
        });
      }
      this.state.activeRoom = null;
      this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
    });
  }

  componentWillUnmount() {
    if (this.state.previewTracks) {
      this.state.previewTracks.forEach(track => {
        track.stop();
      });
    }
    this.state.activeRoom = null;
    this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
  }

  getSessionId() {
    const params = new URLSearchParams(this.props.location.search);
    return params.get("s");
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
    this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
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
        console.log(publication);
        console.log(publication.track);
        console.log(publication.track.attach());
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
      if (this.state.previewTracks) {
        this.state.previewTracks.forEach(track => {
          track.stop();
        });
      }
      this.state.activeRoom = null;
      this.setState({
        hasJoinedRoom: false,
        localMediaAvailable: false,
        remoteMediaAvailable: false
      });
    });
  }

  render() {
    let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
      <button onClick={this.leaveRoom}>Leave room</button>
    ) : (
      <button onClick={this.joinRoom}>Join room</button>
    );

    if (this.state.loading) {
      return <Loader active>Loading Session</Loader>;
    }

    if (!this.state.open) {
      return <p>You are not authorized to access this tutoring session</p>;
    }

    return (
      <div>
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
        {joinOrLeaveRoomButton}
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
