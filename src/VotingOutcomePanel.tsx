import * as React from "react";
import { NonIdealState, Icon, FormGroup } from "@blueprintjs/core";

import { Agent } from "./models/agent";
import { VotingPhase, agentPossessive } from "./models/avalon";
import { cap } from "./models/util";

import "./VotingOutcomePanel.css"
import { AgentLabel } from "./AgentLabel";

function Vote({ agent, vote }: { agent: Agent, vote: boolean }) {
  const icon = vote ? "thumbs-up" : "thumbs-down";
  const intent = vote ? "success" : "danger";
  return <Icon icon={icon} intent={intent} />;
}

export function VotingOutcomePanel({ proposer, votes }: { proposer: Agent, votes: VotingPhase["votes"] }) {
  const nApproves = Object.values(votes).filter(x => !!x).length;
  const nRejects = Object.values(votes).length - nApproves;
  const verb = nApproves > nRejects ? "approved" : "rejected";
  return (
    <NonIdealState
      className="VotingOutcomePanel"
      title={`${cap(agentPossessive(proposer))} mission was ${verb}.`}
      description={
        <div className="VotingOutcomePanel-votes">
          {Object.keys(votes).map(agent => (
            <FormGroup helperText={<AgentLabel cap agent={agent} />}>
              <Vote agent={agent} vote={votes[agent]} />
            </FormGroup>
          ))}
        </div>
      }
    />
  );
}
