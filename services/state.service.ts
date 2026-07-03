import { api } from "./api";

export type State = {
  id: number;
  name: string;
  uf: string;
};

export async function getStates(): Promise<State[]> {
  return api<State[]>("/states/");
}