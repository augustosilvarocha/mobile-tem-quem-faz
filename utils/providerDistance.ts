import { getDistance } from "geolib";

type Coordinates = { latitude: number; longitude: number };

type ProviderLocation = {
  latitude?: number | null;
  longitude?: number | null;
  show_location_on_map?: boolean | null;
};

export function hasValidCoordinates(
  location: Pick<ProviderLocation, "latitude" | "longitude">
): location is Coordinates {
  return (
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

export function getProviderDistanceKm(
  provider: ProviderLocation,
  userLocation: Coordinates | null
): number | null {
  if (
    !userLocation ||
    provider.show_location_on_map !== true ||
    !hasValidCoordinates(provider) ||
    !hasValidCoordinates(userLocation)
  ) {
    return null;
  }

  return getDistance(userLocation, provider) / 1000;
}

export function formatProviderDistance(distanceKm?: number | null): string | null {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return null;
  }

  const distance = distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m`
    : `${distanceKm.toFixed(1).replace(".", ",")} km`;

  return `Aprox. ${distance} de voc\u00ea`;
}
