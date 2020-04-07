import * as React from "react";
import { useHistory } from "react-router-dom";

import { sendEvent } from "./api";
import { joinGame } from "./models/avalon";
import { NonIdealState, Button } from "@blueprintjs/core";
import { make as makeId } from "./models/id";

export function NoGame() {

  const history = useHistory();

  const createGame = () => {
    const id = makeId();
    const e = joinGame(id);
    sendEvent(e)
      .then(() => history.replace(`/${id}`))
      .catch(() => alert('Couldnt make game'));
  };

  const createButton = (
    <Button
      intent="primary"
      icon="add"
      text="Create game"
      onClick={createGame}
    />
  );
  return <NonIdealState action={createButton} />;
}
