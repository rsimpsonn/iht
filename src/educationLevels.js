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

export default getEduLevel;
