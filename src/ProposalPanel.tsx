import * as React from "react";

import { Agent } from "./models/agent";
import { agentName } from "./models/avalon";
import { cap } from "./models/util";

import "./ProposalPanel.css";
import { NonIdealState } from "@blueprintjs/core";
import { AgentLabel } from "./AgentLabel";

export function ProposalPanel({ agent, mission }: { agent: Agent, mission: Agent[] }) {
  return (
    <NonIdealState
      className="ProposalPanel"
      title={`${cap(agentName(agent))} proposed a mission.`}
      description={
        <React.Fragment>
          {mission.map((x, i) => <p key={i}><AgentLabel cap agent={x} /></p>)}
        </React.Fragment>
      }
    />
  );
}
