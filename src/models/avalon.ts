import { Agent, get as getAgent } from "./agent";

type AgentID = string;
type PlayerId = string;
export type GameId = string;
type MissionID = string;

export type Role = "knight" | "minion" | "merlin" | "assassin";
export type Team = "knights" | "minions";

interface JoinGame {
  type: "join-game";
  agent: Agent;
  game: GameId;
}

interface StartGame {
  type: "start-game";
  agent: Agent;
  game: GameId;
}

interface AssignRole {
  type: "assign-role";
  agent: Agent;  // agent doing the assigning
  assignee: Agent;
  role: Role;
  game: GameId;
}

interface FinishAssigningRoles {
  type: "finish-assigning-roles";
  agent: Agent;  // agent doing the assigning
  game: GameId;
}

interface ProposeMission {
  type: "propose-mission";
  agent: Agent;
  mission: Agent[];
  game: GameId;
}

interface Vote {
  type: "vote";
  agent: Agent;
  vote: boolean;
  game: GameId;
}

interface Trial {
  type: "trial";
  agent: Agent;
  trial: boolean;
  game: GameId;
}

export type Event = JoinGame | StartGame | AssignRole | FinishAssigningRoles | ProposeMission | Vote | Trial;

export function joinGame(game: GameId): JoinGame {
  return {
    type: "join-game",
    agent: getAgent(),
    game,
  }
}

export function startGame(game: GameId): StartGame {
  return {
    type: "start-game",
    agent: getAgent(),
    game,
  }
}

export function assignRole(game: GameId, agent: Agent, role: Role): AssignRole {
  return {
    type: "assign-role",
    agent: getAgent(),
    assignee: agent,
    role,
    game,
  };
}

export function proposeMission(game: GameId, agent: Agent, mission: Agent[]): ProposeMission {
  return {
    type: "propose-mission",
    agent,
    mission,
    game,
  };
}

export function vote(game: GameId, vote: boolean): Vote {
  return {
    type: "vote",
    agent: getAgent(),
    vote,
    game,
  };
}

export function trial(game: GameId, agent: Agent, trial: boolean): Trial {
  return {
    type: "trial",
    agent,
    trial,
    game,
  };
}

// Read model

export type GameHistory = Event[];

export function gameStarted(history: GameHistory): boolean {
  return history.find(e => e.type === "start-game") != null;
}

export function amInGame(history: GameHistory): boolean {
  const me = getAgent();
  return history.find(e =>
    (e.type === "join-game" && e.agent === me)) != null;
}

export function canJoin(history: GameHistory): boolean {
  return !gameStarted(history) && !amInGame(history);
}

/**
 * Returns whether or not `agent` is able to start a new game, based on the
 * game's current configuration.
 */
export function canStart(state: NewPhase, agent: Agent): boolean {
  return state.players.length >= 5 &&
    state.players.length <= 10 &&
    state.players.includes(agent);
}

export function gamePlayers(history: GameHistory): Agent[] {
  return history.reduce((players: Agent[], e: Event) => {
    if (e.type === "join-game") return [...players, e.agent];
    return players;
  }, []);
}

function gameSize(g: GameHistory): number {
  return g.reduce((n: number, e: Event) => {
    if (e.type === "join-game") return n + 1;
    return n;
  }, 0);
}

export function gameRound(g: GameHistory): number {
  return 0;
}

export function nextMissionSize(g: GameHistory): number | undefined {
  switch (gameSize(g)) {
    case 5: return [2, 3, 2, 3, 3][gameRound(g)];
    case 6: return [2, 3, 4, 3, 4][gameRound(g)];
    case 7: return [2, 3, 3, 4, 4][gameRound(g)];
    case 8: return [3, 4, 4, 5, 5][gameRound(g)];
    case 9: return [3, 4, 4, 5, 5][gameRound(g)];
    case 10: return [3, 4, 4, 5, 5][gameRound(g)];
  }
}

// For, you know, unnecessary type safety. A game can have between 5 and 10
// players.
export type Players =
  [Agent, Agent, Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent, Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent, Agent, Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent, Agent, Agent, Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent, Agent, Agent, Agent, Agent, Agent, Agent];

// For, you know, unnecessary type safety. A mission can have between 2 and 5
// players.
export type Mission =
  [Agent, Agent] |
  [Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent] |
  [Agent, Agent, Agent, Agent, Agent];

// A game in the "new" phase can be joined and configured.
interface NewPhase {
  type: "new";
  players: Agent[];
}

interface Closed {
  players: Players;
  roles: { [agent: string]: Role };
}

// A game in the "started" phase has fixed players and configuration, but its
// roles have not been assigned yet.
interface StartedPhase extends Closed {
  type: "started";
  players: Players;
}

interface ActivePhase extends Closed {
  players: Players;
  roles: { [agent: string]: Role };
  round: number;
  turn: number;
  consecutiveRejects: number;
  knightsScore: number;
  minionsScore: number;
}

// A game in the "proposing" phase has a defined round number and turn number.
interface ProposingPhase extends ActivePhase {
  type: "proposing";
}

// A game in the "voting" phase has a specific mission that's been proposed,
// and a set of pending votes.
export interface VotingPhase extends ActivePhase {
  type: "voting";
  mission: Mission;
  votes: { [agent: string]: boolean };
}

// A game in the "trial" phase has a mission that's been approved, and those
// players can each pass or fail the mission.
export interface QuestPhase extends ActivePhase {
  type: "quest";
  mission: Mission;
  trials: { [agent: string]: boolean };
}

interface RedemptionPhase extends Closed {
  type: "redemption";
}

interface FinishedPhase {
  type: "finished";
  winner: Team;
}

export type Phase =
  NewPhase |
  StartedPhase |
  ProposingPhase |
  VotingPhase |
  QuestPhase |
  RedemptionPhase |
  FinishedPhase;


type VotingOutcome = "accepted" | "rejected";

export function votingOutcome(g: VotingPhase, e: Vote): VotingOutcome | undefined {
  const nPlayers = g.players.length;
  const nVotes = Object.keys(g.votes).length;
  const alreadyVoted = g.votes.hasOwnProperty(e.agent);

  // If this wouldn't be the last vote anyway, then there is no outcome.
  if (alreadyVoted || nVotes !== nPlayers - 1) return undefined;

  // Count the nunmber of accepts and rejects to determine the outcome.
  const votes = Object.values(g.votes);
  const accepts = votes.filter(x => !!x).length + (+e.vote);
  const rejects = votes.length - accepts + 1;
  return accepts > rejects ? "accepted" : "rejected";
}


export function questOutcome(x: QuestPhase, e: Trial): boolean | undefined {
  const nPlayers = x.mission.length;
  const nVotes = Object.keys(x.trials).length;
  const alreadyVoted = x.trials.hasOwnProperty(e.agent);

  // If this wouldn't be the last vote anyway, then there is no outcome.
  if (alreadyVoted || nVotes !== nPlayers - 1) return undefined;

  // Count the nunmber of fails to determine the outcome.
  const trials = Object.values(x.trials);
  const fails = trials.filter(x => !x).length + (+!e.trial);

  // The 4th quest (index 3) in games of 7 or more players requires at least 2
  // fails to be failed.
  const needed = (x.players.length >= 7 && x.round === 3) ? 2 : 1;
  return fails < needed;
}

function eventValid(x: Phase, e: Event): boolean {
  switch (x.type) {
    case "new":
      switch (e.type) {
        case "join-game":
          return !x.players.includes(e.agent);
        case "start-game":
          return x.players.includes(e.agent) &&
            x.players.length >= 5 &&
            x.players.length <= 10;
      }
      return false;
    case "started":
      switch (e.type) {
        case "assign-role":
          // TODO: Allow other gods.
          return e.agent === "00000000";
        case "finish-assigning-roles":
          // TODO: Allow other gods.
          return e.agent === "00000000";
      }
      return false;
    case "proposing":
      switch (e.type) {
        case "propose-mission":
          return e.agent === proposer(x) &&
            e.mission.length === missionSize(x) &&
            e.mission.filter(p => !x.players.includes(p)).length === 0;
      }
      return false;
    case "voting":
      switch (e.type) {
        case "vote":
          return x.players.includes(e.agent);
      }
      return false;
    case "quest":
      switch (e.type) {
        case "trial":
          return x.mission.includes(e.agent);
      }
      return false;
    case "redemption":
      return false;
    case "finished":
      return false;
  }
}

export function votingPhaseMachine(x: VotingPhase, e: Event): VotingPhase {
  if (e.type === "vote") {
    return { ...x, votes: { ...x.votes, [e.agent]: e.vote } };
  } else {
    return x;
  }
}

export function votingPhaseOutcome(x: VotingPhase): VotingOutcome | undefined {
  const nPlayers = x.players.length;
  const nVotes = Object.keys(x.votes).length;

  // If not all players have voted, then there is no outcome.
  if (nVotes !== nPlayers) return undefined;

  // Count the nunmber of accepts and rejects to determine the outcome.
  const votes = Object.values(x.votes);
  const accepts = votes.filter(x => !!x).length;
  const rejects = votes.length - accepts;
  return accepts > rejects ? "accepted" : "rejected";
}

export function phaseMachine(x: Phase, e: Event): Phase {
  console.log('Considering handling', e);
  if (!eventValid(x, e)) {
    console.log('Dropping', e);
    return x;
  }

  // unborn
  // created
  // started
  // proposing
  // voting
  // trial
  // proposing
  // voting
  // trial
  // proposing
  // voting
  // proposing
  // voting
  // trial
  // redemption
  // finished

  switch (x.type) {
    case "new":
      switch (e.type) {
        case "join-game":
          return { type: "new", players: [...x.players, e.agent]}
        case "start-game":
          return { type: "started", players: x.players as Players, roles: {} };
      }
      return x;
    case "started":
      switch (e.type) {
        case "assign-role":
          return {
            type: x.type,
            players: x.players,
            roles: { ...x.roles, [e.assignee]: e.role },
          };
        case "finish-assigning-roles":
          return {
            type: "proposing",
            players: x.players,
            roles: x.roles,
            round: 0,
            turn: 0,
            consecutiveRejects: 0,
            knightsScore: 0,
            minionsScore: 0,
          };
      }
      return x;
    case "proposing":
      switch (e.type) {
        case "propose-mission":
          return {
            type: "voting",
            players: x.players,
            roles: x.roles,
            round: x.round,
            turn: x.turn,
            consecutiveRejects: x.consecutiveRejects,
            knightsScore: x.knightsScore,
            minionsScore: x.minionsScore,
            mission: e.mission as Mission,
            votes: {},
          };
      }
      return x;
    case "voting":
      const next = votingPhaseMachine(x, e);
      const outcome = votingPhaseOutcome(next);
      if (outcome === "accepted") {
        // TODO: Save `next` phase to record log here.
        return {
          type: "quest",
          players: x.players,
          roles: x.roles,
          round: x.round,
          turn: x.turn,
          consecutiveRejects: 0,
          knightsScore: x.knightsScore,
          minionsScore: x.minionsScore,
          mission: x.mission,
          trials: {},
        };
      } else if (outcome === "rejected") {
        // TODO: Save `next` phase to record log here.
        return {
          type: "proposing",
          players: x.players,
          roles: x.roles,
          round: x.round,
          turn: x.turn + 1,
          consecutiveRejects: x.consecutiveRejects + 1,
          knightsScore: x.knightsScore,
          minionsScore: x.minionsScore,
        };
      }
      return next;
    case "quest":
      switch (e.type) {
        case "trial":
          const outcome = questOutcome(x, e);
          if (outcome == null) {
            return { ...x, trials: { ...x.trials, [e.agent]: e.trial } };
          } else if (outcome) {
            return {
              type: "proposing",
              players: x.players,
              roles: x.roles,
              round: x.round + 1,
              turn: x.turn + 1,
              consecutiveRejects: x.consecutiveRejects,
              knightsScore: x.knightsScore + 1,
              minionsScore: x.minionsScore,
            };
          } else {
            return {
              type: "proposing",
              players: x.players,
              roles: x.roles,
              round: x.round + 1,
              turn: x.turn + 1,
              consecutiveRejects: x.consecutiveRejects,
              knightsScore: x.knightsScore,
              minionsScore: x.minionsScore + 1,
            };
          }
      }
      return x;
    case "redemption":
      return x;
    case "finished":
      return x;
  }
}

export function gamePhase(g: GameHistory): Phase {
  return g.reduce(phaseMachine, { type: "new", players: [] });
}

export function roleTeam(x: Role): Team {
  switch (x) {
    case "knight": return "knights";
    case "minion": return "minions";
    case "merlin": return "knights";
    case "assassin": return "minions";
  }
}

export function agentTeam(state: ProposingPhase | VotingPhase | QuestPhase, agent: Agent): Team {
  const role = state.roles[agent];
  return roleTeam(role);
}

export function proposer(x: ProposingPhase | VotingPhase | QuestPhase): Agent {
  return x.players[x.turn % x.players.length];
}

export function missionSize(x: ProposingPhase | VotingPhase | QuestPhase): number {
  switch (x.players.length) {
    case 5: return [2, 3, 2, 3, 3][x.round];
    case 6: return [2, 3, 4, 3, 4][x.round];
    case 7: return [2, 3, 3, 4, 4][x.round];
    case 8: return [3, 4, 4, 5, 5][x.round];
    case 9: return [3, 4, 4, 5, 5][x.round];
    case 10: return [3, 4, 4, 5, 5][x.round];
  }
}

export function agentName(agent: Agent): string {
  const me = getAgent();
  return agent === me ? "you" : agent;
}

export function agentPossessive(agent: Agent): string {
  const me = getAgent();
  return agent === me ? "your" : `${agent}'s`;
}
