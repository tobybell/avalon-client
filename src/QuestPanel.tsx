import * as React from "react";
import { NonIdealState, Button } from "@blueprintjs/core";

import { get as getAgent } from "./models/agent";
import { QuestPhase, GameId, trial, agentTeam } from "./models/avalon";
import { sendEvent } from "./api";

import "./QuestPanel.css"

function PassButton({ active, onClick }: { active: boolean, onClick(): void }) {
  return (
    <Button
      minimal
      large
      icon="shield"
      text="Pass"
      intent="primary"
      active={active}
      onClick={onClick}
    />
  );
}

function FailButton({ active, onClick }: { active: boolean, onClick(): void }) {
  return (
    <Button
      minimal
      large
      icon="locate"
      text="Fail"
      intent="danger"
      active={active}
      onClick={onClick}
    />
  );
}


export function QuestPanel({ id, phase }: { id: GameId, phase: QuestPhase }) {

  const doVote = (v: boolean) => {
    const event = trial(id, getAgent(), v);
    sendEvent(event);
  }
  const voteYes = () => doVote(true);
  const voteNo = () => doVote(false);

  const me = getAgent();
  const team = agentTeam(phase, me);
  const verb = team === "minions" ? "Choose" : "Make";
  const myTrial = phase.trials[me];

  return (
    <NonIdealState
      className="QuestPanel"
      title="You're on the mission."
      description={`${verb} your contribution.`}
      action={
        <div className="QuestPanel-options">
          <PassButton active={myTrial === true} onClick={voteYes} />
          {team === "minions" &&
            <FailButton active={myTrial === false} onClick={voteNo} />}
        </div>
      }
    />
  );
}
