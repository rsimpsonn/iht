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
      }
      setState({ initializing: false, user, isTutor });
    }

    React.useEffect(() => {
      const unsubscribe = firebase.auth.onAuthStateChanged(onChange);

      return () => unsubscribe();
    }, []);

    return state;
  };

  const { initializing, user, isTutor } = useAuth();

  if (initializing) {
    return <div>Loading</div>;
  }

  return (
    <userContext.Provider value={{ user, isTutor }}>
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
    </userContext.Provider>
  );
}

export default App;
