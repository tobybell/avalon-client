
import * as React from "react";
import { NonIdealState, Icon } from "@blueprintjs/core";

import { QuestRecord } from "./models/records";

import "./QuestRecordPanel.css"
import { repeat } from "./models/util";

function Pass() {
  return <Icon icon="shield" intent="primary" />;
}

function Fail() {
  return <Icon icon="locate" intent="danger" />;
}

export function QuestRecordPanel({ record }: { record: QuestRecord }) {
  const verb = record.passed ? "passed" : "failed";
  return (
    <NonIdealState
      className="QuestRecordPanel"
      title={`The mission ${verb}.`}
      description={
        <div className="QuestRecordPanel-trials">
          {repeat(record.nPasses, i => <Pass key={i} />)}
          {repeat(record.nFails, i => <Fail key={i} />)}
        </div>
      }
    />
  );
}
