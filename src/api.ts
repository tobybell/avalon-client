import { Event } from "./models/avalon";

type GameID = string;

// const HURL = `http://${process.env.REACT_APP_SERVER_HOST}`;
// const WURL = `ws://${process.env.REACT_APP_SERVER_HOST}`;
const HURL = `http://avalon-server.tobu.me`;
const WURL = `ws://avalon-server.tobu.me`;

export function sendEvent(event: Event) {
  const method = "POST";
  const body = JSON.stringify(event);
  const headers = { "Content-Type": "application/json;charset=utf-8" };
  return fetch(`${HURL}/games`, { method, headers, body }).then();
}

export async function fetchHistory(game: GameID): Promise<any[]> {
  return fetch(`${HURL}/games/${game}`).then(res => res.json());
}

export function gameSocket(game: GameID): WebSocket {
  return new WebSocket(`${WURL}/games/${game}`);
}
