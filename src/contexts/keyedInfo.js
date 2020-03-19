import React from "react";
import firebase from "../firebase";

let keyedInfoInit = {
  levels: {},
  subjects: {},
  universities: {}
};

const collections = {
  levels: "educationLevels",
  subjects: "subjects",
  universities: "universities"
};

let keyedInfoReducer = async (state, action) => {
  const id = action.id;
  const type = action.type;

  if (state[type][id]) {
    return { ...state };
  }

  const ref = firebase.db.collection(collections[type]).doc(id);
  const doc = await ref.get();
  state[type][id] = doc.data();
  return { ...state };
};

const keyedInfoContext = React.createContext();

export { keyedInfoInit, keyedInfoReducer, keyedInfoContext };
