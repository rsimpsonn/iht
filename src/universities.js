import firebase from "./firebase";

let loadedUniversities = {
  universities: {}
};

const getUniversity = async id => {
  if (loadedUniversities[id]) {
    console.log("university already loaded");
    return loadedUniversities[id];
  }

  const uniRef = firebase.db.collection("universities").doc(id);
  const university = await uniRef.get();
  loadedUniversities[id] = { id, ...university.data() };

  return { id, ...university.data() };

};

export default getUniversity;
