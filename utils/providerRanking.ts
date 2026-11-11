import { getDistance } from "geolib";
import { getCityCoordinates } from "./cityCoordinates";
import { getProviderDistanceKm } from "./providerDistance";
import type { ProviderCardData } from "@/hooks/useProviders";

type Coordinates = { latitude: number; longitude: number };

export function rankProviders(
  providers: ProviderCardData[],
  userLocation: Coordinates | null,
  preferredCity: { name: string; uf: string } | null
) {
  const origin = userLocation ?? (preferredCity ? getCityCoordinates(preferredCity.name, preferredCity.uf) : null);
  return providers.map((provider) => {
    const preciseDistance = getProviderDistanceKm(provider, userLocation);
    const cityDistance = origin && provider.cityCoordinates
      ? getDistance(origin, provider.cityCoordinates) / 1000
      : null;
    return {
      ...provider,
      distanceKm: preciseDistance ?? cityDistance,
      distanceFromCity: !userLocation || preciseDistance === null,
    };
  }).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}
