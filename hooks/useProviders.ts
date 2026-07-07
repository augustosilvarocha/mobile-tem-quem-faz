import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";

import {
  getCachedProviders,
  getProviders,
  Provider,
  ProviderCityFilter,
  ProviderFilter,
} from "@/services/provider.service";

export type ProviderCardData = {
  id: number;
  name: string;
  category: string;
  categoryNames: string[];
  city: string;
  photo?: string;
};

type UseProvidersOptions = {
  category?: string | null;
  city?: string | null;
  enabled?: boolean;
  uf?: string | null;
};

const USER_CITY_FILTER_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedUserCityFilter: ProviderCityFilter | undefined;
let cachedUserCityFilterAt = 0;
let hasCachedUserCityFilter = false;
let pendingUserCityFilterRequest: Promise<ProviderCityFilter | undefined> | null = null;

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

async function loadUserCityFilter(): Promise<ProviderCityFilter | undefined> {
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

function hasFreshUserCityFilter() {
  return (
    hasCachedUserCityFilter &&
    Date.now() - cachedUserCityFilterAt < USER_CITY_FILTER_CACHE_TTL_MS
  );
}

function getCachedUserCityFilter() {
  if (!hasFreshUserCityFilter()) {
    return undefined;
  }

  return cachedUserCityFilter;
}

async function getUserCityFilter(): Promise<ProviderCityFilter | undefined> {
  if (hasFreshUserCityFilter()) {
    return cachedUserCityFilter;
  }

  if (pendingUserCityFilterRequest) {
    return pendingUserCityFilterRequest;
  }

  pendingUserCityFilterRequest = loadUserCityFilter()
    .then((cityFilter) => {
      cachedUserCityFilter = cityFilter;
      cachedUserCityFilterAt = Date.now();
      hasCachedUserCityFilter = true;

      return cityFilter;
    })
    .finally(() => {
      pendingUserCityFilterRequest = null;
    });

  return pendingUserCityFilterRequest;
}

function formatProvider(provider: Provider): ProviderCardData {
  const categoryNames = provider.category_names ?? [];

  return {
    id: provider.id,
    name: provider.name,
    category: categoryNames.join(", ") || "Prestador de servico",
    categoryNames,
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

function getProviderFilter(options: {
  category?: string;
  city?: string;
  uf?: string;
}): ProviderFilter | undefined {
  if (!options.category && !options.city && !options.uf) {
    return undefined;
  }

  return {
    category: options.category,
    city: options.city,
    uf: options.uf,
  };
}

function getCachedProviderCards(
  providerFilterOptions: {
    category?: string;
    city?: string;
    uf?: string;
  },
  enabled: boolean
) {
  if (!enabled) {
    return [];
  }

  const cachedProviders = getCachedProviders(getProviderFilter(providerFilterOptions));

  if (!cachedProviders) {
    return null;
  }

  return sortProvidersByLocation(
    cachedProviders,
    getCachedUserCityFilter()
  ).map(formatProvider);
}

export function useProviders(options: UseProvidersOptions = {}) {
  const categoryFilter = options.category?.trim();
  const cityFilter = options.city?.trim();
  const ufFilter = options.uf?.trim();
  const enabled = options.enabled ?? true;
  const providerFilterOptions = useMemo(
    () => ({
      category: categoryFilter || undefined,
      city: cityFilter || undefined,
      uf: ufFilter || undefined,
    }),
    [categoryFilter, cityFilter, ufFilter]
  );
  const cachedProviderCards = getCachedProviderCards(
    providerFilterOptions,
    enabled
  );
  const [providers, setProviders] = useState<ProviderCardData[]>(
    () => cachedProviderCards ?? []
  );
  const [loading, setLoading] = useState(
    () => enabled && cachedProviderCards === null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!enabled) {
      setProviders([]);
      setLoading(false);
      setError(null);
      return;
    }

    async function loadProviders() {
      try {
        const cachedProviderCards = getCachedProviderCards(
          providerFilterOptions,
          enabled
        );

        if (cachedProviderCards) {
          setProviders(cachedProviderCards);
          setLoading(false);
        } else {
          setLoading(true);
        }

        setError(null);

        const cityFilter = await getUserCityFilter();
        const data = await getProviders(getProviderFilter(providerFilterOptions));
        const sortedProviders = sortProvidersByLocation(data, cityFilter);

        if (!isActive) {
          return;
        }

        setProviders(sortedProviders.map(formatProvider));
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao buscar prestadores:", error);
        setError("Nao foi possivel carregar os prestadores.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProviders();

    return () => {
      isActive = false;
    };
  }, [enabled, providerFilterOptions]);

  return { providers, loading, error };
}
