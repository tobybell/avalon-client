import { Event, Phase, Players, Mission, votingOutcome, questOutcome, proposer } from "./avalon";
import { Record, gameRecord, votingRecord, rolesRecord, proposalRecord, questRecord, winRecord } from "./records";

interface State {
  records: Record[];
  phase: Phase;
}

export function stateMachine(state: State, e: Event): State {
  const { records, phase } = state;
  switch (phase.type) {
    case "new":
      switch (e.type) {
        case "join-game":
          return {
            records,
            phase: {
              ...phase,
              players: [...phase.players, e.agent],
            }
          };
        case "start-game":
          return {
            records: [...records, gameRecord(phase.players as Players)],
            phase: {
              type: "started",
              players: phase.players as Players,
              roles: {},
            },
          };
      }
      return state;
    case "started":
      switch (e.type) {
        case "assign-role":
          return {
            records,
            phase: {
              type: phase.type,
              players: phase.players,
              roles: { ...phase.roles, [e.assignee]: e.role },
            },
          };
        case "finish-assigning-roles":
          return {
            records: [...records, rolesRecord(phase.roles)],
            phase: {
              type: "proposing",
              players: phase.players,
              roles: phase.roles,
              round: 0,
              turn: 0,
              consecutiveRejects: 0,
              knightsScore: 0,
              minionsScore: 0,
            },
          };
      }
      return state;
    case "proposing":
      switch (e.type) {
        case "propose-mission":
          return {
            records: [...records, proposalRecord(e.agent, e.mission)],
            phase: {
              type: "voting",
              players: phase.players,
              roles: phase.roles,
              round: phase.round,
              turn: phase.turn,
              consecutiveRejects: phase.consecutiveRejects,
              knightsScore: phase.knightsScore,
              minionsScore: phase.minionsScore,
              mission: e.mission as Mission,
              votes: {},
            },
          };
      }
      return state;
    case "voting":
      switch (e.type) {
        case "vote":
          const newVotes = { ...phase.votes, [e.agent]: e.vote };
          const outcome = votingOutcome(phase, e);
          if (outcome == null) {
            return { records, phase: { ...phase, votes: newVotes } };
          } else if (outcome === "accepted") {
            return {
              records: [...records, votingRecord(proposer(phase), newVotes)],
              phase: {
                type: "quest",
                players: phase.players,
                roles: phase.roles,
                round: phase.round,
                turn: phase.turn,
                consecutiveRejects: 0,
                knightsScore: phase.knightsScore,
                minionsScore: phase.minionsScore,
                mission: phase.mission,
                trials: {},
              },
            };
          } else if (outcome === "rejected") {
            return {
              records: [...records, votingRecord(proposer(phase), newVotes)],
              phase: {
                type: "proposing",
                players: phase.players,
                roles: phase.roles,
                round: phase.round,
                turn: phase.turn + 1,
                consecutiveRejects: phase.consecutiveRejects + 1,
                knightsScore: phase.knightsScore,
                minionsScore: phase.minionsScore,
              },
            };
          }
      }
      return state;
    case "quest":
      switch (e.type) {
        case "trial":
          const outcome = questOutcome(phase, e);
          const newTrials = { ...phase.trials, [e.agent]: e.trial };
          if (outcome == null) {
            return { records, phase: { ...phase, trials: newTrials } };
          }

          const nPasses = Object.values(newTrials).filter(x => !!x).length;
          const nFails = Object.keys(newTrials).length - nPasses;
          const qRecord = questRecord(outcome, nPasses, nFails);

          if (outcome) {
            const knightsScore = phase.knightsScore + 1;
            if (knightsScore === 3) {
              return {
                records: [...records, qRecord ],
                phase: { ...phase, type: "redemption" },
              };
            } else /* no win */ {
              return {
                records: [...records, qRecord],
                phase: {
                  ...phase,
                  type: "proposing",
                  round: phase.round + 1,
                  turn: phase.turn + 1,
                  knightsScore,
                },
              }
            }
          } else {
            const minionsScore = phase.minionsScore + 1;
            if (minionsScore === 3) {
              return {
                records: [...records, qRecord, winRecord("minions")],
                phase: { type: "finished", winner: "minions" },
              };
            } else /* no win */ {
              return {
                records: [...records, qRecord],
                phase: {
                  ...phase,
                  type: "proposing",
                  round: phase.round + 1,
                  turn: phase.turn + 1,
                  minionsScore,
                },
              }
            }
          }
      }
      return state;
    case "redemption":
      return state;
    case "finished":
      return state;
  }
}
