const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.newRequest = functions.firestore
  .document("sessions/{session}")
  .onCreate((snap, context) => {
    const doc = snap.data();

    const now = new Date();

    const clientRef = db.doc("clients/" + doc.client);

    clientRef.get().then(clientData => {
      const client = clientData.data();

      const alert = {
        to: doc.tutor,
        actionText: "See request",
        actionType: "link",
        url: "/",
        message: "You have a new session request from " + client.firstName,
        time: now
      };

      console.log(alert);

      db.collection("alerts").add(alert);
    });
  });

exports.updateRequest = functions.firestore
  .document("sessions/{session}")
  .onUpdate((change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const tutorRef = db.doc("tutors/" + before.tutor);
    tutorRef
      .get()
      .then(doc => {
        const tutor = doc.data();

        if (before.status === "Requested" && after.status === "Upcoming") {
          db.collection("alerts").add({
            to: before.client,
            actionText: "See upcoming session",
            actionType: "Link",
            url: "/",
            message: tutor.firstName + " has accepted your session request",
            time: now
          });
        } else if (
          before.status === "Requested" &&
          after.status === "Declined"
        ) {
          db.collection("alerts").add({
            to: before.client,
            message: tutor.firstName + " has declined your session request",
            time: now
          });
        }
      })
      .catch(e => console.log(e));
  });
