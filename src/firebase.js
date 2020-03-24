import * as firebase from "firebase";

const config = {
  apiKey: "AIzaSyBu7tncDUwnoD19AON-2nbnh2cBHIimN0U",
  authDomain: "ivyhometutors.firebaseapp.com",
  databaseURL: "https://ivyhometutors.firebaseio.com",
  projectId: "ivyhometutors",
  storageBucket: "ivyhometutors.appspot.com",
  messagingSenderId: "229814723851",
  appId: "1:229814723851:web:967424ed4457e0f72e2e0e",
  measurementId: "G-JFF21KK0LB"
};

let app = firebase.initializeApp(config);
firebase.analytics();

const fb = {
  auth: firebase.auth(),
  db: firebase.firestore(app),
  storage: firebase.storage()
};

export default fb;
