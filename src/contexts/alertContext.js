import React from "react";

const alertContext = React.createContext({
  newAlert: {},
  setNewAlert: alert => {}
});

export default alertContext;
