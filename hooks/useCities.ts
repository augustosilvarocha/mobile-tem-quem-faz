import { useEffect, useState } from "react";

import { City, getCities } from "@/services/city.service";

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCities() {
      try {
        setLoading(true);
        setError(null);

        const data = await getCities();

        setCities(data);
      } catch (error) {
        console.log("Erro ao buscar cidades:", error);
        setError("Não foi possível carregar as cidades.");
      } finally {
        setLoading(false);
      }
    }

    loadCities();
  }, []);

  return { cities, loading, error };
}