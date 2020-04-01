const functions = require("firebase-functions");

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
    pass: functions.config().gmail.password
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

    if (alert.mail) {
      const userType = await db.doc("users/" + alert.to).get();
      const user = userType.data();

      let emails = [];

      const userData = await admin.auth().getUser(alert.to);
      emails.push(userData.email);

      if (!user.isTutor) {
        const clientData = await db.doc("clients/" + alert.to).get();
        const client = clientData.data();

        if (client.emailNotifications) {
          emails = emails.concat(client.emailNotifications);
        }
      }

      emails.forEach(async e => {
        let html = `<img style="width: 100px; height: auto" src="https://firebasestorage.googleapis.com/v0/b/ivyhometutors.appspot.com/o/ivybase.png?alt=media&token=8a0deb2b-90d5-44f4-842e-f047390e294c" />
        <br />
        <p>${alert.description}</p>
        `;

        if (alert.actionType === "link") {
          html += `<a href="${alert.url}">${alert.actionText}</a>`;
        }

        const mailOptions = {
          from: "ivybase Tutors <ivybasetutors@gmail.com>",
          to: e,
          subject: alert.message,
          html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(info);

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      });
    }
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
  .schedule("every 60 minutes")
  .onRun(context => {
    const now = new Date();
    db.collection("sessions")
      .where("status", "==", "Upcoming")
      .where("end", "<=", now)
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(d => {
          const sessionData = d.data();
          db.doc("sessions/" + d.id).set(
            { status: "Completed" },
            { merge: true }
          );
          db.collection(
            "stripe_customers/" + sessionData.client + "/charges"
          ).add({ amount: 2500, sessionId: d.id });
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
