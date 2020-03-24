import firebase from "./firebase";

let loadedMajors = {
  majors: {}
};

const getMajor = async id => {
  if (loadedMajors[id]) {
    console.log("university already loaded");
    return loadedMajors[id];
  }

  const uniRef = firebase.db.collection("majors").doc(id);
  const major = await uniRef.get();
  loadedMajors[id] = { id, ...major.data() };

  return { id, ...major.data() };
};

export const getAllMajors = async () => {
  const allRef = firebase.db.collection("majors");
  const snapshot = await allRef.get();
  let all = [];
  snapshot.docs.forEach(doc => {
    const major = {
      id: doc.id,
      ...doc.data()
    };
    all.push(major);
    loadedMajors[doc.id] = major;
  });

  return all;
};

export default getMajor;
