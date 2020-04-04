type GameID = string;

export function sendEvent(event: any) {
  const method = "GET";
  const body = JSON.stringify(event);
  const headers = { "Content-Type": "application/json;charset=utf-8" };
  fetch("/games/576", { method, headers, body });
}

export async function fetchHistory(game: GameID): Promise<any[]> {
  return fetch(`/games/${game}`).then(res => res.json());
}
