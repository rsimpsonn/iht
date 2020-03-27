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

export const getAllUniversities = async () => {
  const allRef = firebase.db.collection("universities");
  const snapshot = await allRef.get();
  let all = [];
  snapshot.docs.forEach(doc => {
    const university = {
      id: doc.id,
      ...doc.data()
    };
    all.push(university);
    loadedUniversities[doc.id] = university;
  });

  return all;
};

export default getUniversity;
