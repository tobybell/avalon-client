import * as id from "./id";

/** Browser local storage. */
const storage = window.localStorage;

/** Type used to identify an agent; we use a single string ID. */
export type Agent = string;

const agent: Agent = (() => {
  const existing = storage.getItem("agent");
  if (existing != null) {
    return existing;
  }
  const newAgent = id.make();
  storage.setItem("agent", newAgent);
  return newAgent;
})();

/**
 * Get the current agent ID.
 *
 * NOTE: If the user's browser has never chosen an agent ID before, calling
 * this function will generate a new one and save it. It will then always
 * return the same value in the future unless the user clears their local
 * storage.
 */
export function get(): Agent {
  return agent;
}
