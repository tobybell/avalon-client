import { Agent } from "./agent";
import { Role, Players, Team } from "./avalon";

export interface GameRecord {
  type: "game";
  players: Players;
}

export interface RolesRecord {
  type: "roles";
  roles: { [agent: string]: Role };
}

export interface ProposalRecord {
  type: "proposal";
  proposer: Agent;
  mission: Agent[];
}

export interface VotingRecord {
  type: "voting";
  proposer: Agent;
  votes: { [agent: string]: boolean };
}

export interface QuestRecord {
  type: "quest";
  passed: boolean;
  nPasses: number;
  nFails: number;
}

export interface ScoreRecord {
  type: "score";
  knights: number;
  minions: number;
}

export interface WinRecord {
  type: "win";
  team: Team;
}

export type Record =
  GameRecord |
  RolesRecord |
  ProposalRecord |
  VotingRecord |
  QuestRecord |
  ScoreRecord |
  WinRecord;

export function gameRecord(players: Players): GameRecord {
  return { type: "game", players };
}

export function rolesRecord(roles: { [agent: string]: Role }): RolesRecord {
  return { type: "roles", roles };
}

export function proposalRecord(proposer: Agent, mission: Agent[]): ProposalRecord {
  return { type: "proposal", proposer, mission };
}

export function votingRecord(proposer: Agent, votes: { [agent: string]: boolean }): VotingRecord {
  return { type: "voting", proposer, votes };
}

export function questRecord(passed: boolean, nPasses: number, nFails: number): QuestRecord {
  return { type: "quest", passed, nPasses, nFails };
}

export function scoreRecord(knights: number, minions: number): ScoreRecord {
  return { type: "score", knights, minions };
}

export function winRecord(winner: Team): WinRecord {
  return { type: "win", team: winner };
}
