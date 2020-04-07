import * as React from "react";
import { useParams } from "react-router-dom";
import { NonIdealState, Spinner, Navbar, Button } from "@blueprintjs/core";

import { sendEvent } from "./api";
import { get as getAgent } from "./models/agent";
import { Event, GameHistory, GameId, joinGame, startGame, gamePlayers, gamePhase, canJoin, proposer, agentPossessive, missionSize, canStart } from "./models/avalon";
import { CreatedPane } from "./CreatedPane";
import { ProposePanel } from "./ProposePanel";
import { VotingPanel } from "./VotingPanel";
import { ProposalPanel } from "./ProposalPanel";
import { QuestPanel } from "./QuestPanel";
import { RolesPanel } from "./RolesPanel";

import "./Game.css";
import { VotingOutcomePanel } from "./VotingOutcomePanel";
import { stateMachine } from "./models/combines";
import { Record } from "./models/records";
import { QuestRecordPanel } from "./QuestRecordPanel";
import { GameRecordPanel } from "./GameRecordPanel";

function renderRecord(record: Record, i: number) {
  if (record.type === "game") {
    return <GameRecordPanel key={i} record={record} />
  }
  if (record.type === "roles") {
    return <RolesPanel key={i} roles={record.roles} />;
  }
  if (record.type === "proposal") {
    return <ProposalPanel key={i} agent={record.proposer} mission={record.mission} />;
  }
  if (record.type === "voting") {
    return <VotingOutcomePanel key={i} proposer={record.proposer} votes={record.votes} />;
  }
  if (record.type === "quest") {
    return <QuestRecordPanel key={i} record={record} />;
  }
}

function RecordsList({ records }: { records: Record[] }) {
  return <div className="EventList">{records.map(renderRecord)}</div>;
}

function StartBar({ game }: { game: GameId }) {
  const doStart = () => {
    const e = startGame(game);
    sendEvent(e).catch(alert);
  };
  return (
    <Navbar className="StartBar">
      <Navbar.Group align="center">
        <Button intent="success" onClick={doStart}>Start game</Button>
      </Navbar.Group>
    </Navbar>
  );
}

function JoinBar({ game }: { game: GameId }) {
  const doJoin = () => {
    const e = joinGame(game);
    sendEvent(e).catch(alert);
  };
  return (
    <Navbar className="JoinBar">
      <Navbar.Group align="center">
        <Button intent="success" onClick={doJoin}>Join this game</Button>
      </Navbar.Group>
    </Navbar>
  );
}

function StatusPanel({ status }: { status: string | JSX.Element }) {
  return (
    <NonIdealState className="StatusPanel" title={status} />
  );
}

function reduceEvents(events: Event[] | undefined, event: Event | Event[]): Event[] | undefined {
  if (Array.isArray(event)) {
    return events ? [...events, ...event] : event;
  } else {
    return events ? [...events, event] : [event];
  }
}

export function Game() {
  const { gameId } = useParams();

  const [game, dispatch] = React.useReducer(reduceEvents, undefined);

  React.useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3001/games/${gameId}`);
    ws.onmessage = m => {
      try {
        const event = JSON.parse(m.data);
        console.log(event);
        dispatch(event);
      } catch (e) {
        console.log(m.data);
      }
    }
    return () => ws.close();
  }, [gameId]);

  if (gameId == null || game == null) {
    return <NonIdealState icon={<Spinner />} />
  }

  return <LoadedGame id={gameId} game={game} />;
}

function LoadedGame({ id, game }: { id: GameId, game: GameHistory }) {
  const players = React.useMemo(() => gamePlayers(game), [game]);

  const me = getAgent();

  const otherState = game.reduce(stateMachine, { records: [], phase: { type: "new", players: [] } });
  console.log(otherState);

  const { records, phase } = otherState;

  return (
    <div className="Game">
      <div className="Game-scroller">
        <RecordsList records={records} />
        {phase.type === "new" && canStart(phase, me) &&
          <StartBar game={id} />}
        {canJoin(game) && <JoinBar game={id} />}
        {phase.type === "proposing" && (
          proposer(phase) === me ?
            <ProposePanel game={id} players={players} des={missionSize(phase)} /> :
            <StatusPanel status={`It's ${agentPossessive(proposer(phase))} turn to propse a mission.`} />)}
        {phase.type === "voting" && <VotingPanel id={id} phase={phase} />}
        {phase.type === "quest" && (
          phase.mission.includes(me) ?
            <QuestPanel id={id} phase={phase} /> :
            <StatusPanel status="Mission in progress." />)}
        {phase.type === "redemption" &&
          <StatusPanel status={`The knights have almost won.`} />}
        {phase.type === "finished" &&
          <StatusPanel status={`Game finished. The ${phase.winner} won.`} />}
      </div>
    </div>
  );
}