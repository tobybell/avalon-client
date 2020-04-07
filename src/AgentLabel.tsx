import * as React from "react";

import { Agent } from "./models/agent";
import { agentName } from "./models/avalon";
import { cap as capitalize } from "./models/util";

export function AgentLabel({ agent, cap = false }: { agent: Agent, cap?: boolean }) {
  const name = agentName(agent);
  const text = cap ? capitalize(name) : name;
  return <span>{text}</span>;
}
