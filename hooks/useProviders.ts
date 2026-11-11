import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  PreferredCity,
  useLocationPreference,
} from "@/contexts/LocationPreferenceContext";
import {
  getCachedProviders,
  getFavoriteProviders,
  getProviders,
  Provider,
  ProviderFilter,
  searchProviders,
} from "@/services/provider.service";
import { getCityCoordinates } from "@/utils/cityCoordinates";
import { rankProviders } from "@/utils/providerRanking";

export type ProviderCardData = {
  id: number;
  name: string;
  category: string;
  categoryNames: string[];
  city: string;
  photo?: string;
  latitude?: number | null;
  longitude?: number | null;
  show_location_on_map?: boolean | null;
  distanceKm?: number | null;
  distanceFromCity?: boolean;
  cityCoordinates?: { latitude: number; longitude: number } | null;
};

type UseProvidersOptions = {
  favoritesOnly?: boolean;
  category?: string | null;
  city?: string | null;
  enabled?: boolean;
  searchText?: string | null;
  uf?: string | null;
};

function formatProvider(provider: Provider): ProviderCardData {
  const categoryNames = provider.category_names ?? [];

  return {
    cityCoordinates: getCityCoordinates(provider.city_name, provider.uf),
    id: provider.id,
    name: provider.user.name,
    category: categoryNames.join(", ") || "Prestador de serviço",
    categoryNames,
    city: `${provider.city_name} - ${provider.uf}`,
    photo: provider.photo || undefined,
    latitude: provider.latitude,
    longitude: provider.longitude,
    show_location_on_map: provider.show_location_on_map,
  };
}

function normalizeText(value?: string | null) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getLocationPriority(
  provider: Provider,
  preferredCity: PreferredCity | null
) {
  if (!preferredCity) {
    return 0;
  }

  const userCity = normalizeText(preferredCity.name);
  const userState = normalizeText(preferredCity.stateName);
  const userUf = normalizeText(preferredCity.uf);
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

function sortProvidersByLocation(
  providers: Provider[],
  preferredCity: PreferredCity | null
) {
  return [...providers].sort((currentProvider, nextProvider) => {
    const currentPriority = getLocationPriority(currentProvider, preferredCity);
    const nextPriority = getLocationPriority(nextProvider, preferredCity);

    if (currentPriority !== nextPriority) {
      return currentPriority - nextPriority;
    }

    return (currentProvider.user.name ?? "").localeCompare(nextProvider.user.name ?? "");
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
  enabled: boolean,
  preferredCity: PreferredCity | null
) {
  if (!enabled) {
    return [];
  }

  const cachedProviders = getCachedProviders(getProviderFilter(providerFilterOptions));

  if (!cachedProviders) {
    return null;
  }

  return sortProvidersByLocation(cachedProviders, preferredCity).map(
    formatProvider
  );
}

export function useProviders(options: UseProvidersOptions = {}) {
  const {
    loading: loadingLocationPreference,
    preferredCity,
    userLocation,
  } = useLocationPreference();
  const categoryFilter = options.category?.trim();
  const cityFilter = options.city?.trim();
  const searchText = options.searchText?.trim();
  const ufFilter = options.uf?.trim();
  const enabled = options.enabled ?? true;
  const favoritesOnly = options.favoritesOnly ?? false;
  const isSearchMode = Boolean(searchText);
  const providerFilterOptions = useMemo(
    () => ({
      category: categoryFilter || undefined,
      city: cityFilter || undefined,
      uf: ufFilter || undefined,
    }),
    [categoryFilter, cityFilter, ufFilter]
  );
  const cachedProviderCards = isSearchMode || favoritesOnly || loadingLocationPreference
    ? null
    : getCachedProviderCards(
        providerFilterOptions,
        enabled,
        preferredCity
      );
  const [providers, setProviders] = useState<ProviderCardData[]>(
    () => cachedProviderCards ?? []
  );
  const [loading, setLoading] = useState(
    () => enabled && cachedProviderCards === null
  );
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let isActive = true;

    if (!enabled) {
      setProviders([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (loadingLocationPreference) {
      setLoading(true);
      return;
    }

    async function loadProviders() {
      try {
        if (isSearchMode || favoritesOnly) {
          setProviders([]);
          setLoading(true);
        } else {
          const cachedProviderCards = getCachedProviderCards(
            providerFilterOptions,
            enabled,
            preferredCity
          );

          if (cachedProviderCards) {
            setProviders(cachedProviderCards);
            setLoading(false);
          } else {
            setLoading(true);
          }
        }

        setError(null);

        const data = favoritesOnly
          ? await getFavoriteProviders()
          : isSearchMode
          ? await searchProviders(searchText ?? "")
          : await getProviders(getProviderFilter(providerFilterOptions));
        const sortedProviders = sortProvidersByLocation(data, preferredCity);

        if (!isActive) {
          return;
        }

        setProviders(sortedProviders.map(formatProvider));
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao buscar prestadores:", error);
        setError(
          favoritesOnly
            ? "Não foi possível carregar seus favoritos. Verifique sua conexão e se você está conectado à sua conta."
            : isSearchMode
            ? "Não foi possível buscar prestadores."
            : "Não foi possível carregar os prestadores."
        );
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
  }, [
    enabled,
    favoritesOnly,
    isSearchMode,
    loadingLocationPreference,
    preferredCity,
    providerFilterOptions,
    searchText,
  ]));

  const providersWithDistance = useMemo(
    () => rankProviders(providers, userLocation, preferredCity),
    [providers, userLocation, preferredCity]
  );

  return { providers: providersWithDistance, loading, error };
}
