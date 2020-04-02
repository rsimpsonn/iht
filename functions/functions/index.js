const functions = require("firebase-functions");

const emailFormatters = require("./emailFormatter");

const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const stripe = require("stripe")(functions.config().stripe.token);
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ivybasetutors@gmail.com",
    pass: "P@jamoo$3"
  }
});

/*exports.getStripeCustomer = functions.http.onCall(async (data, context) => {
  const uid = context.auth.uid;

  const stripeCustomerDoc = await db.doc("stripe_customers/" + uid).get();

  const stripeCustomer = stripeCustomer.data();

  const { err, customer } = await stripe.customers.retrieve(
    stripeCustomer.customer_id
  );

  if (err) {
    return {
      error: "Could not find Stripe customer"
    };
  }

  return {
    error: null,
    customer
  };
});*/

exports.emailNotifications = functions.firestore
  .document("alerts/{newAlert}")
  .onCreate(async (snap, context) => {
    const alert = snap.data();

    if (!alert.mail) {
      return;
    }
    const formatter = emailFormatters[alert.formatter];
    const payload = {};

    if (alert.tutor) {
      const tutor = await db.doc("tutors/" + alert.tutor).get();
      payload.tutor = tutor.data();
    }

    if (alert.client) {
      const client = await db.doc("clients/" + alert.client).get();
      payload.client = client.data();
    }

    if (alert.session) {
      const session = await db.doc("sessions/" + alert.session).get();
      payload.session = session.data();

      if (alert.cancelledBy) {
        const cancelledByTutor = alert.cancelledBy === session.tutor;
        let cancelledBy = {};
        if (cancelledByTutor) {
          cancelledBy = await db.doc("tutors/" + alert.tutor).get();
        } else {
          cancelledBy = await db.doc("clients/" + alert.client).get();
        }
        payload.cancelledBy = cancelledBy;
      }
    }

    if (alert.subject) {
      const subject = await db.doc("subjects/" + alert.subject).get();
      payload.subject = subject.data().title;
    }

    if (alert.type) {
      payload.type = alert.type;
    }

    if (alert.chargeAmount) {
      payload.chargeAmount = alert.chargeAmount;
    }

    if (alert.reason) {
      payload.reason = alert.reason;
    }

    const userType = await db.doc("users/" + alert.to).get();
    const user = userType.data();

    let emails = [];

    const userData = await admin.auth().getUser(alert.to);

    emails.push(userData.email);

    if (!user.isTutor) {
      const clientData = await db.doc("clients/" + alert.to).get();
      const client = clientData.data();
      payload.to = client;

      if (client.emailNotifications) {
        emails = emails.concat(client.emailNotifications);
      }
    } else {
      const tutorData = await db.doc("tutors/" + alert.to).get();
      const tutor = tutorData.data();
      payload.to = tutor;
    }

    const formattedEmail = formatter(payload);

    console.log(formattedEmail);

    let preAction = "";
    let postAction = "";

    const action = formattedEmail.indexOf("act;;");
    if (action === -1) {
      preAction = formattedEmail;
    } else {
      preAction = formattedEmail.substring(0, action);
      postAction = formattedEmail.substring(action + 5);
    }

    emails.forEach(async e => {
      let html = `<img style="width: 100px; height: auto" src="https://firebasestorage.googleapis.com/v0/b/ivyhometutors.appspot.com/o/ivybase.png?alt=media&token=8a0deb2b-90d5-44f4-842e-f047390e294c" />
        <br />
        <p>${preAction}</p>
        `;

      if (alert.actionType === "link") {
        html += `<a href="${alert.url}">${alert.actionText}</a>`;
      }

      html += postAction;

      const mailOptions = {
        from: "ivybase Tutors <ivybasetutors@gmail.com>",
        to: e,
        subject: alert.message,
        html
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    });
  });

exports.createIntent = functions.firestore
  .document("stripe_customers/{userId}/intents/{newIntent}")
  .onCreate(async (snap, context) => {
    const uid = context.params.userId;
    const customerDoc = await db.doc("stripe_customers/" + uid).get();
    const customer = customerDoc.data();
    const intent = await stripe.setupIntents.create({
      customer: customer.customer_id
    });

    db.doc(
      "stripe_customers/" + uid + "/intents/" + context.params.newIntent
    ).set({ fulfilled: true, secret: intent.client_secret });
  });

exports.completeSessions = functions.pubsub
  .schedule("1 * * * *")
  .onRun(async context => {
    const now = new Date();

    const sessionsSnap = await db
      .collection("sessions")
      .where("status", "==", "Upcoming")
      .where("end", "<=", now)
      .get();
    sessionsSnap.docs.forEach(d => {
      const sessionData = d.data();
      if (sessionData.recurring) {
        const startDate = sessionData.start.toDate();
        startDate.setDate(startDate.getDate() + 7);
        const endDate = sessionData.end.toDate();
        endDate.setDate(endDate.getDate() + 7);
        db.collection("sessions").add({
          ...sessionData,
          start: startDate,
          end: endDate
        });
      }

      const start = sessionData.start.toDate();

      const now = new Date();

      db.collection("alerts").add({
        mail: true,
        to: sessionData.tutor,
        client: sessionData.client,
        session: d.id,
        chargeAmount: "20.00",
        formatter: "completedSessionTutor",
        message: `Thank you for tutoring on ${start.getMonth()}/${start.getDate()} 💚`,
        time: now
      });

      db.collection("alerts").add({
        mail: true,
        tutor: sessionData.tutor,
        to: sessionData.client,
        session: d.id,
        chargeAmount: "25.00",
        formatter: "completedSessionClient",
        message: `Your tutoring session on ${start.getMonth()}/${start.getDate()}`,
        time: now
      });

      db.doc("sessions/" + d.id).set({ status: "Completed" }, { merge: true });
      db.collection("stripe_customers/" + sessionData.client + "/charges").add({
        amount: 2500,
        sessionId: d.id
      });
    });
  });

exports.fulfillCharge = functions.firestore
  .document("stripe_customers/{userId}/charges/{id}")
  .onCreate(async (snap, context) => {
    const charge = snap.data();
    const customerDoc = await db
      .doc("stripe_customers/" + context.params.userId)
      .get();
    const customer = customerDoc.data();
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.customer_id,
      type: "card"
    });
    const paymentMethod = paymentMethods.data[0]
      ? paymentMethods.data[0].id
      : false;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: charge.amount,
        currency: "usd",
        customer: customer.customer_id,
        payment_method: paymentMethod,
        off_session: true,
        confirm: true
      });
      console.log("fulfilled");
    } catch (err) {
      // Error code will be authentication_required if authentication is needed
      console.log("Error code is: ", err.code);
      const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(
        err.raw.payment_intent.id
      );
      console.log("PI retrieved: ", paymentIntentRetrieved.id);
    }
  });

exports.createStripeCustomer = functions.auth.user().onCreate(async user => {
  const customer = await stripe.customers.create({ email: user.email });
  return db
    .doc("stripe_customers/" + user.uid)
    .set({ customer_id: customer.id });
});

exports.newRequest = functions.firestore
  .document("sessions/{session}")
  .onCreate(async (snap, context) => {
    const doc = snap.data();

    if (doc.status !== "Requested") {
      return;
    }

    const now = new Date();

    const clientRef = db.doc("clients/" + doc.client);

    const clientData = await clientRef.get();

    const client = clientData.data();

    const alert = {
      mail: true,
      to: doc.tutor,
      client: doc.client,
      session: snap.id,
      subject: doc.subjectID,
      formatter: "initRequest",
      actionText: "Go to dashboard",
      actionType: "link",
      url: "http://localhost:3000/dashboard",
      message: "You have a new session request from " + client.firstName,
      time: now
    };

    console.log(alert);

    db.collection("alerts").add(alert);
  });

exports.remindAvailabilityWeekly = functions.firestore.pubsub
  .schedule("0 17 * * 3")
  .onRun(async context => {
    const tutorSnapshot = await db.collection("tutors").get();

    const now = new Date();

    tutorSnapshot.docs.forEach(t => {
      db.collection("alerts").add({
        mail: true,
        to: t.id,
        formatter: "remindAvailability",
        actionText: "Go to dashboard",
        actionType: "link",
        url: "http://localhost:3000/dashboard",
        message: "Confirm tutoring availability for next week",
        time: now
      });
    });
  });

exports.setAvailability = functions.firestore.pubsub
  .schedule("59 24 * * 0")
  .onRun(async context => {
    const tutorSnapshot = await db.collection("tutors").get();

    tutorSnapshot.docs.forEach(async t => {
      const tutor = t.data();

      const now = new Date();

      const pastTimeSlotsSnap = await db
        .collection(`tutors/${t.id}/opentimeslots`)
        .where("end", "<=", now)
        .get();
      pastTimeSlotsSnap.docs.forEach(ts => ts.delete());

      db.doc("tutors/" + t.id).set(
        {
          available: tutor.availableNextWeek,
          availableNextWeek: false
        },
        { merge: true }
      );
    });
  });

exports.verifyTutors = functions.firestore
  .document("verifications/{tutor}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const now = new Date();

    if (!before.isVerified && after.isVerified) {
      db.collection("alerts").add({
        mail: true,
        to: context.params.tutor,
        message: "Your transcript has been verified",
        formatter: "reviewedTranscript",
        actionText: "Go to dashboard",
        actionType: "link",
        url: "http://localhost:3000/dashboard",
        time: now
      });
    } else if (before.status === "Pending" && after.status === "Declined") {
      db.collection("alerts").add({
        mail: true,
        to: context.params.tutor,
        message: "Your transcript could not be verified",
        formatter: "declinedTranscript",
        actionText: "Go to dashboard",
        actionType: "link",
        url: "http://localhost:3000/dashboard",
        reason: after.rejectedReason,
        time: now
      });
    }
  });

exports.updateRequest = functions.firestore
  .document("sessions/{session}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const now = new Date();

    const tutorRef = db.doc("tutors/" + before.tutor);
    const doc = await tutorRef.get();
    const tutor = doc.data();

    if (before.status === "Requested" && after.status === "Upcoming") {
      db.collection("alerts").add({
        mail: true,
        tutor: before.tutor,
        session: change.before.id,
        to: before.client,
        formatter: "acceptedRequest",
        actionText: "See upcoming session",
        actionType: "link",
        url: "http://localhost:3000/dashboard",
        message: tutor.firstName + " has accepted your session request",
        time: now
      });
    } else if (before.status === "Requested" && after.status === "Declined") {
      db.collection("alerts").add({
        mail: true,
        tutor: before.tutor,
        session: change.before.id,
        formatter: "declinedRequest",
        actionText: "Schedule a new session",
        actionType: "link",
        url: "http://localhost:3000/dashboard",
        to: before.client,
        message: tutor.firstName + " has declined your session request",
        time: now
      });
    } else if (
      before.status === "Upcoming" &&
      after.status === "Cancelled no fee"
    ) {
      db.collection("alerts").add({
        mail: true,
        to: after.cancelledBy === after.tutor ? before.client : before.tutor,
        session: change.before.id,
        formatter: "cancellation",
        actionText: "Schedule a new session",
        actionType: "link",
        url: "http://localhost:3000/dashboard",
        message: "Your tutoring session has been cancelled",
        time: now
      });
    } else if (
      before.status === "Upcoming" &&
      after.status === "Cancelled fee"
    ) {
      if (after.cancelledBy === after.tutor) {
        if (!tutor.warnings) {
          db.collection("alerts").add({
            mail: true,
            to: before.tutor,
            session: change.before.id,
            client: before.client,
            formatter: "firstWarning",
            message: "Under 24-Hour Cancellation Warning",
            time: now
          });

          db.doc("tutors/" + before.tutor).set(
            { warnings: 1 },
            { merge: true }
          );
        } else {
          db.collection("alerts").add({
            mail: true,
            to: before.tutor,
            session: change.before.id,
            client: before.client,
            formatter: "termination",
            message: "Your account has been terminated",
            time: now
          });

          db.doc("tutors/" + before.tutor).set(
            { warnings: false, terminated: true },
            { merge: true }
          );
        }
      } else {
        db.collection("alerts").add({
          mail: true,
          to: before.client,
          tutor: before.tutor,
          session: change.before.id,
          chargeAmount: "25.00",
          message: "Under 24-Hour Cancellation",
          time: now
        });
      }
    }
  });
