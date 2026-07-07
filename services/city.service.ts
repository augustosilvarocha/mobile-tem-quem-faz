import { api } from "./api";
import { createMemoryCache } from "./memoryCache";

export type City = {
  id: number;
  name: string;
  state: number;
  state_name: string;
  uf: string;
};

const citiesCache = createMemoryCache<City[]>();

export function getCachedCities() {
  return citiesCache.getCached();
}

export function clearCitiesCache() {
  citiesCache.clear();
}

export async function getCities(): Promise<City[]> {
  return citiesCache.get(() => api<City[]>("/cities/"));
}
