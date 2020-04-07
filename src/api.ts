import { Event } from "./models/avalon";

type GameID = string;

export function sendEvent(event: Event) {
  const method = "POST";
  const body = JSON.stringify(event);
  const headers = { "Content-Type": "application/json;charset=utf-8" };
  return fetch("/games", { method, headers, body }).then();
}

export async function fetchHistory(game: GameID): Promise<any[]> {
  return fetch(`/games/${game}`).then(res => res.json());
}
