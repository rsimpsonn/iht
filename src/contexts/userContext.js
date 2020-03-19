import React from "react";

const userContext = React.createContext({
  user: null,
  isTutor: false
});

export default userContext;
