import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";

import { NoGame } from "./NoGame";
import { Game } from "./Game";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={NoGame} />
        <Route exact path="/:gameId" component={Game} />
      </Switch>
    </Router>
  );
}

export default App;
