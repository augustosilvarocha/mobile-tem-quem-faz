import { useEffect, useState } from "react";
import * as Location from "expo-location";

import {
  getProviders,
  Provider,
  ProviderCityFilter,
} from "@/services/provider.service";

export type ProviderCardData = {
  id: number;
  name: string;
  category: string;
  city: string;
  photo?: string;
};

function getStateFilter(region?: string | null): Pick<ProviderCityFilter, "state" | "uf"> {
  const normalizedRegion = region?.trim();

  if (!normalizedRegion) {
    return {};
  }

  if (normalizedRegion.length === 2) {
    return { uf: normalizedRegion.toUpperCase() };
  }

  return { state: normalizedRegion };
}

async function getUserCityFilter(): Promise<ProviderCityFilter | undefined> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      return undefined;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const city = address?.city ?? address?.subregion;

    if (!city) {
      return undefined;
    }

    return {
      city,
      ...getStateFilter(address.region),
    };
  } catch (error) {
    console.log("Erro ao obter cidade pela localizacao:", error);
    return undefined;
  }
}

function formatProvider(provider: Provider): ProviderCardData {
  return {
    id: provider.id,
    name: provider.name,
    category: provider.category_names?.join(", ") || "Prestador de servico",
    city: `${provider.city_name} - ${provider.uf}`,
    photo: provider.photo || undefined,
  };
}

function normalizeText(value?: string | null) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getLocationPriority(provider: Provider, cityFilter?: ProviderCityFilter) {
  if (!cityFilter?.city) {
    return 0;
  }

  const userCity = normalizeText(cityFilter.city);
  const userState = normalizeText(cityFilter.state);
  const userUf = normalizeText(cityFilter.uf);
  const providerCity = normalizeText(provider.city_name);
  const providerState = normalizeText(provider.state_name);
  const providerUf = normalizeText(provider.uf);

  const isSameCity = providerCity === userCity;
  const isSameState = Boolean(
    (userUf && providerUf === userUf) || (userState && providerState === userState)
  );

  if (isSameCity && isSameState) {
    return 0;
  }

  if (isSameCity) {
    return 1;
  }

  if (isSameState) {
    return 2;
  }

  return 3;
}

function sortProvidersByLocation(providers: Provider[], cityFilter?: ProviderCityFilter) {
  return [...providers].sort((currentProvider, nextProvider) => {
    const currentPriority = getLocationPriority(currentProvider, cityFilter);
    const nextPriority = getLocationPriority(nextProvider, cityFilter);

    if (currentPriority !== nextPriority) {
      return currentPriority - nextPriority;
    }

    return currentProvider.name.localeCompare(nextProvider.name);
  });
}

export function useProviders() {
  const [providers, setProviders] = useState<ProviderCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProviders() {
      try {
        setLoading(true);
        setError(null);

        const cityFilter = await getUserCityFilter();
        const data = await getProviders();
        const sortedProviders = sortProvidersByLocation(data, cityFilter);

        setProviders(sortedProviders.map(formatProvider));
      } catch (error) {
        console.log("Erro ao buscar prestadores:", error);
        setError("Nao foi possivel carregar os prestadores.");
      } finally {
        setLoading(false);
      }
    }

    loadProviders();
  }, []);

  return { providers, loading, error };
}
