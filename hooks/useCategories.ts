import { useEffect, useState } from "react";

import {
  Category,
  getCachedCategories,
  getCategories,
} from "@/services/category.service";

export function useCategories() {
  const cachedCategories = getCachedCategories();
  const [categories, setCategories] = useState<Category[]>(
    () => cachedCategories ?? []
  );
  const [loading, setLoading] = useState(() => !cachedCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        setLoading(!getCachedCategories());
        setError(null);

        const data = await getCategories();

        if (isActive) {
          setCategories(data);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.log("Erro ao buscar categorias:", error);
        setError("Nao foi possivel carregar as categorias.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    categories,
    loading,
    error,
  };
}
