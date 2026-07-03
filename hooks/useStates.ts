import { useEffect, useState } from "react";

import { State, getStates } from "@/services/state.service";

export function useStates() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStates() {
      try {
        setLoading(true);
        setError(null);

        const data = await getStates();

        setStates(data);
      } catch (error) {
        console.log("Erro ao buscar estados:", error);
        setError("Não foi possível carregar os estados.");
      } finally {
        setLoading(false);
      }
    }

    loadStates();
  }, []);

  return { states, loading, error };
}