import React from "react";

const userDetailsContext = React.createContext({
  userDetails: {},
  setUserDetails: details => {}
});

export default userDetailsContext;
