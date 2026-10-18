import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location";
import { AppState } from "react-native";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PREFERRED_CITY_KEY = "preferred_city";

export type PreferredCity = {
  id: number;
  name: string;
  stateName: string;
  uf: string;
};

type UserLocation = { latitude: number; longitude: number };

type LocationPreferenceContextValue = {
  loading: boolean;
  preferredCity: PreferredCity | null;
  setPreferredCity: (city: PreferredCity | null) => Promise<void>;
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
};

const LocationPreferenceContext =
  createContext<LocationPreferenceContextValue | null>(null);

function isPreferredCity(value: unknown): value is PreferredCity {
  if (!value || typeof value !== "object") {
    return false;
  }

  const city = value as Partial<PreferredCity>;

  return (
    typeof city.id === "number" &&
    typeof city.name === "string" &&
    typeof city.stateName === "string" &&
    typeof city.uf === "string"
  );
}

export function LocationPreferenceProvider({ children }: { children: ReactNode }) {
  const [preferredCity, setPreferredCityState] = useState<PreferredCity | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    let isActive = true;
    let isRefreshing = false;

    async function refreshUserLocation() {
      if (!isActive || isRefreshing) {
        return;
      }

      isRefreshing = true;

      try {
        const permission = await Location.getForegroundPermissionsAsync();

        if (!isActive) {
          return;
        }

        if (permission.status !== Location.PermissionStatus.GRANTED) {
          setUserLocation(null);
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();

        if (!isActive) {
          return;
        }

        if (!servicesEnabled) {
          setUserLocation(null);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isActive) {
          setUserLocation(location.coords);
        }
      } catch (error) {
        if (isActive) {
          console.log("Erro ao obter localizacao para distancia:", error);
        }
      } finally {
        isRefreshing = false;
      }
    }

    refreshUserLocation();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshUserLocation();
      }
    });

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadPreferredCity() {
      try {
        const storedCity = await SecureStore.getItemAsync(PREFERRED_CITY_KEY);

        if (!storedCity) {
          return;
        }

        const parsedCity: unknown = JSON.parse(storedCity);

        if (isActive && isPreferredCity(parsedCity)) {
          setPreferredCityState(parsedCity);
        }
      } catch (error) {
        console.log("Erro ao carregar cidade escolhida:", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadPreferredCity();

    return () => {
      isActive = false;
    };
  }, []);

  async function setPreferredCity(city: PreferredCity | null) {
    setPreferredCityState(city);

    try {
      if (city) {
        await SecureStore.setItemAsync(PREFERRED_CITY_KEY, JSON.stringify(city));
      } else {
        await SecureStore.deleteItemAsync(PREFERRED_CITY_KEY);
      }
    } catch (error) {
      console.log("Erro ao salvar cidade escolhida:", error);
    }
  }

  const value = useMemo(
    () => ({ loading, preferredCity, setPreferredCity, userLocation, setUserLocation }),
    [loading, preferredCity, userLocation]
  );

  return (
    <LocationPreferenceContext.Provider value={value}>
      {children}
    </LocationPreferenceContext.Provider>
  );
}

export function useLocationPreference() {
  const context = useContext(LocationPreferenceContext);

  if (!context) {
    throw new Error(
      "useLocationPreference deve ser usado dentro de LocationPreferenceProvider."
    );
  }

  return context;
}
