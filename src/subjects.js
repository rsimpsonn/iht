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

export const getAllSubjects = async () => {
  const allRef = firebase.db.collection("subjects");
  const snapshot = await allRef.get();
  let all = [];
  snapshot.docs.forEach(doc => {
    const subject = {
      id: doc.id,
      ...doc.data()
    };
    all.push(subject);
    loadedSubjects[doc.id] = subject;
  });

  return all;
};

export default getSubject;
