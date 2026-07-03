import { api } from "./api";

export type City = {
  id: number;
  name: string;
  state: number;
  state_name: string;
  uf: string;
};

export async function getCities(): Promise<City[]> {
  return api<City[]>("/cities/");
}