import * as React from "react";

import { Agent } from "./models/agent";
import { agentName } from "./models/avalon";
import { cap } from "./models/util";

import "./JoinPane.css";

export function JoinPane({ player }: { player: Agent }) {
  return <p className="JoinPane">{cap(agentName(player))} joined.</p>;
}
