import firebase from "./firebase";

let loadedTutors = {
  tutors: {}
};

const getTutor = async id => {
  if (loadedTutors[id]) {
    console.log("tutor already loaded");
    return loadedTutors[id];
  }

  const tutRef = firebase.db.collection("tutors").doc(id);
  const tutor = await tutRef.get();
  loadedTutors[id] = tutor.data();

  return tutor.data();
};

export default getTutor;
