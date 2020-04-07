import * as React from "react";
import { NonIdealState, Button } from "@blueprintjs/core";

import { get as getAgent } from "./models/agent";
import { VotingPhase, proposer, agentPossessive, agentName, vote, GameId } from "./models/avalon";
import { cap } from "./models/util";
import { sendEvent } from "./api";

import "./VotingPanel.css"

const ApproveButton = ({ active, onClick }: { active: boolean, onClick(): void }) => (
  <Button
    large
    minimal
    icon="thumbs-up"
    text="Approve"
    intent="success"
    active={active}
    onClick={onClick}
  />
);

const RejectButton = ({ active, onClick }: { active: boolean, onClick(): void }) => (
  <Button
    large
    minimal
    icon="thumbs-down"
    text="Reject"
    intent="danger"
    active={active}
    onClick={onClick}
  />
);

export function VotingPanel({ id, phase }: { id: GameId, phase: VotingPhase }) {

  const doVote = (v: boolean) => {
    const event = vote(id, v);
    sendEvent(event);
  }
  const voteYes = () => doVote(true);
  const voteNo = () => doVote(false);

  const me = getAgent();
  const myVote = phase.votes[me];

  return (
    <NonIdealState
      className="VotingPanel"
      title={`Vote on ${agentPossessive(proposer(phase))} mission.`}
      description={
        <React.Fragment>
          {phase.mission.map(x => <p key={x}>{cap(agentName(x))}</p>)}
        </React.Fragment>
      }
      action={
        <div className="VotingPanel-options">
          <ApproveButton active={myVote === true} onClick={voteYes} />
          <RejectButton active={myVote === false} onClick={voteNo} />
        </div>
      }
    />
  );
}
