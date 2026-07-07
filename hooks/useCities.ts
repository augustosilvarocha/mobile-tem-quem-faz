import { useEffect, useState } from "react";

import { City, getCachedCities, getCities } from "@/services/city.service";

export function useCities() {
  const cachedCities = getCachedCities();
  const [cities, setCities] = useState<City[]>(() => cachedCities ?? []);
  const [loading, setLoading] = useState(() => !cachedCities);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCities() {
      try {
        setLoading(!getCachedCities());
        setError(null);

        const data = await getCities();

        if (isActive) {
          setCities(data);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao buscar cidades:", error);
        setError("Nao foi possivel carregar as cidades.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadCities();

    return () => {
      isActive = false;
    };
  }, []);

  return { cities, loading, error };
}
