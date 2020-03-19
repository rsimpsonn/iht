import firebase from "./firebase";

let loadedSubjects = {
  subjects: {}
};

const getSubject = async id => {
  if (loadedSubjects[id]) {
    console.log("subject already loaded");
    return loadedSubjects[id];
  }

  const subRef = firebase.db.collection("subjects").doc(id);
  const subject = await subRef.get();
  loadedSubjects[id] = { id, ...subject.data() };

  return { id, ...subject.data() };
};

export default getSubject;
