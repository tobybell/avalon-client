import * as React from "react";
import { NonIdealState } from "@blueprintjs/core";

import "./CreatedPane.css";

export function CreatedPane() {
  return (
    <NonIdealState
      className="CreatedPane"
      title="New game"
      description={
        <p>
          5–10 players.<br/>
          Merlin + Assassin
        </p>
      }
    />
  );
  // return <p>{player} created the game.</p>;
}
