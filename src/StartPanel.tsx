import * as React from "react";
import { NonIdealState } from "@blueprintjs/core";

import { Agent } from "./models/agent";
import { agentName } from "./models/avalon";
import { cap } from "./models/util";
import { AgentLabel } from "./AgentLabel";

import "./StartPanel.css";

export function StartPanel({ players }: { players: Agent[] }) {
  return (
    <NonIdealState
      className="StartPanel"
      title={`New Game`}
      description={
        <React.Fragment>
          {players.map((x, i) => <p key={i}><AgentLabel cap agent={x} /></p>)}
        </React.Fragment>
      }
    />
  );
}
