import firebase from "./firebase";

let loadedLevels = {
  levels: {}
};

const getEduLevel = async id => {
  if (loadedLevels[id]) {
    console.log("subject already loaded");
    return loadedLevels[id];
  }

  const levRef = firebase.db.collection("educationLevels").doc(id);
  const eduLevel = await levRef.get();
  loadedLevels[id] = eduLevel.data();

  return eduLevel.data();
};

export const getAllEducationLevels = async () => {
  const allRef = firebase.db.collection("educationLevels");
  const snapshot = await allRef.get();
  let all = [];
  snapshot.docs.forEach(doc => {
    const eduLevel = {
      id: doc.id,
      ...doc.data()
    };
    all.push(eduLevel);
    loadedLevels[doc.id] = eduLevel;
  });

  return all;
};

export default getEduLevel;
