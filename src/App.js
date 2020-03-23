import React from "react";
import logo from "./logo.svg";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Availability from "./pages/Availability";

import Toolbar from "./components/Toolbar";

import firebase from "./firebase";
import userContext from "./contexts/userContext";
import alertContext from "./contexts/alertContext";

function App() {
  const useAuth = () => {
    const [state, setState] = React.useState(() => {
      const user = firebase.auth.currentUser;
      return {
        initializing: !user,
        user,
        isTutor: false
      };
    });

    async function onChange(user) {
      let isTutor = false;
      if (user !== null) {
        const ref = firebase.db.collection("users").doc(user.uid);
        const doc = await ref.get();
        isTutor = doc.data().isTutor;

        setState({ initializing: false, user, isTutor });
      } else {
        setState({ initializing: false, user, isTutor });
      }
    }

    React.useEffect(() => {
      const unsubscribe = firebase.auth.onAuthStateChanged(onChange);

      return () => unsubscribe();
    }, []);

    return state;
  };

  const { initializing, user, isTutor } = useAuth();

  const useAlerts = () => {
    const [state, setState] = React.useState(() => {
      const setNewAlert = newAlert => {
        setState({ newAlert, setNewAlert });

        if (newAlert.until) {
          const now = new Date();
          const stopAt =
            newAlert.until instanceof Date
              ? newAlert.until
              : newAlert.until.toDate();
          console.log(stopAt.getTime() - now.getTime());
          setTimeout(() => {
            setState({
              newAlert: {},
              setNewAlert
            });
          }, stopAt.getTime() - now.getTime());
        }
      };

      return {
        newAlert: {},
        setNewAlert
      };
    });

    return state;
  };

  const { newAlert, setNewAlert } = useAlerts();

  if (initializing) {
    return <div>Loading</div>;
  }

  return (
    <userContext.Provider value={{ user, isTutor }}>
      <alertContext.Provider value={{ newAlert, setNewAlert }}>
        <Router>
          <Toolbar />
          <Switch>
            <Route path="/availability">
              <Availability />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </Router>
      </alertContext.Provider>
    </userContext.Provider>
  );
}

export default App;
