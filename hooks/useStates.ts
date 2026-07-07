import { useEffect, useState } from "react";

import { State, getCachedStates, getStates } from "@/services/state.service";

export function useStates() {
  const cachedStates = getCachedStates();
  const [states, setStates] = useState<State[]>(() => cachedStates ?? []);
  const [loading, setLoading] = useState(() => !cachedStates);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadStates() {
      try {
        setLoading(!getCachedStates());
        setError(null);

        const data = await getStates();

        if (isActive) {
          setStates(data);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao buscar estados:", error);
        setError("Nao foi possivel carregar os estados.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadStates();

    return () => {
      isActive = false;
    };
  }, []);

  return { states, loading, error };
}
