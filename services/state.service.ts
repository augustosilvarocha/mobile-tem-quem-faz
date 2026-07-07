import { api } from "./api";
import { createMemoryCache } from "./memoryCache";

export type State = {
  id: number;
  name: string;
  uf: string;
};

const statesCache = createMemoryCache<State[]>();

export function getCachedStates() {
  return statesCache.getCached();
}

export function clearStatesCache() {
  statesCache.clear();
}

export async function getStates(): Promise<State[]> {
  return statesCache.get(() => api<State[]>("/states/"));
}
