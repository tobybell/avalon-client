import * as React from "react";
import { NonIdealState } from "@blueprintjs/core";

import { GameRecord } from "./models/records";
import { AgentLabel } from "./AgentLabel";

import "./GameRecordPanel.css";

export function GameRecordPanel({ record }: { record: GameRecord }) {
  return (
    <NonIdealState
      className="GameRecordPanel"
      title="New game"
      description={
        <React.Fragment>
          {record.players.map((x, i) => <p key={i}><AgentLabel cap agent={x} /></p>)}
        </React.Fragment>
      }
    />
  );
}
