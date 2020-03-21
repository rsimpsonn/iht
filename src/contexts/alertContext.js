import React from "react";

const alertContext = React.createContext({
  alerts: [],
  bannerAlert: false,
  addAlerts: () => {}
});

export default alertContext;
