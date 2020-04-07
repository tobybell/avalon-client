import * as React from "react";
import { Checkbox, FormGroup, Button, NonIdealState } from "@blueprintjs/core";

import { Agent, get as getAgent } from "./models/agent";
import { GameId, proposeMission } from "./models/avalon";

import "./ProposePanel.css";
import { sendEvent } from "./api";

export function ProposePanel({ players, game, des }: {
  players: Agent[],
  game: GameId,
  des?: number,
}) {
  const desiredNumber = des;
  const [selected, setSelected] = React.useState<{ [x: string]: boolean }>({});

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const agent = e.currentTarget.value;
    const checked = e.currentTarget.checked;
    setSelected({ ...selected, [agent]: checked });
  };

  const numSelected = Object.values(selected).filter(x => !!x).length;
  const enough = numSelected === desiredNumber;
  const ready = enough || !desiredNumber;

  const doPropose = () => {
    const missionMembers = Object.keys(selected).filter(x => selected[x]);
    const event = proposeMission(game, getAgent(), missionMembers);
    sendEvent(event);
  };

  return (
    <NonIdealState className="ProposePanel"
      title="It's your turn to propose a mission."
      description={
        <React.Fragment>
          <p>Choose <b>{desiredNumber == null ? "any number of" : desiredNumber}</b> players.</p>
          <FormGroup className="ProposePanel-form">
            {players.map(x => (
              <Checkbox
                key={x}
                label={x}
                value={x}
                disabled={enough && !selected[x]}
                checked={selected[x]}
                onChange={handleChange}
              />
            ))}
          </FormGroup>
        </React.Fragment>
      }
      action={
        <Button
          intent="warning"
          text="Propose mission"
          disabled={!ready}
          onClick={doPropose}
        />
      }
    />
  );
}
