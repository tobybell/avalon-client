import * as React from "react";

import { Agent } from "./models/agent";
import { AgentLabel } from "./AgentLabel";

export function AgentsLabel({ agents }: { agents: Agent[] }) {
  const pieces = [];
  if (agents.length === 2) {
    pieces.push(<AgentLabel agent={agents[0]} />);
    pieces.push(" and ");
    pieces.push(<AgentLabel agent={agents[1]} />);
  } else {
    for (let i = 0; i < agents.length; i += 1) {
      pieces.push(<AgentLabel agent={agents[i]} />);
      if (i < agents.length - 2) pieces.push(", ");
      if (i === agents.length - 2) pieces.push(", and ");
    }
  }
  return <React.Fragment>{pieces}</React.Fragment>;
}
