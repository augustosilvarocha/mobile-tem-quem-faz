import { useEffect, useState } from "react";

import { Category, getCategories } from "@/services/category.service";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);

        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        console.log("Erro ao buscar categorias:", error);
        setError("Não foi possível carregar as categorias.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
  };
}
