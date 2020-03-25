const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const stripe = require("stripe")(functions.config().stripe.token);

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
