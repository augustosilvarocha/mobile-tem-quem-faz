import coordinates from "@/assets/cityCoordinates.json";

const cities: Record<string, number[]> = coordinates;

export function getCityCoordinates(name: string, uf: string) {
  const key = `${name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()}|${uf.toUpperCase()}`;
  const point = cities[key];
  return point ? { latitude: point[0], longitude: point[1] } : null;
}
