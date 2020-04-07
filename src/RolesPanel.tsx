import * as React from "react";
import { NonIdealState } from "@blueprintjs/core";

import { get as getAgent } from "./models/agent";
import { Role, roleTeam } from "./models/avalon";

import "./RolesPanel.css"
import { AgentsLabel } from "./AgentsLabel";

function roleName(role: Role): string {
  switch (role) {
    case "assassin": return "the assassin";
    case "knight": return "a knight";
    case "minion": return "a minion";
    case "merlin": return "Merlin";
  }
}

function roleDescription(role: Role, roles: { [agent: string]: Role }) {
  switch (role) {
    case "knight": return undefined;
    case "assassin":
    case "minion":
    case "merlin":
      const minions =
        Object.keys(roles).filter(x => roleTeam(roles[x]) === "minions");
      return (
        <React.Fragment>
          <AgentsLabel agents={minions} />
          {minions.length === 1 ? " is a minion" : " are minions"}.
        </React.Fragment>
      )
  }
}

export function RolesPanel({ roles }: { roles: { [agent: string]: Role }}) {
  const me = getAgent();
  const myRole = roles[me];
  return (
    <NonIdealState
      className="RolesPanel"
      title={`You are ${roleName(myRole)}.`}
      description={roleDescription(myRole, roles)}
    />
  );
}
