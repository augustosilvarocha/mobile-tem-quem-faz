import { useEffect, useState } from "react";
import { Image } from "expo-image";

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
        setError("Não foi possível carregar as categorias.");
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

  useEffect(() => {
    // Warm only the first screen, leaving bandwidth for other app requests.
    const images = [...new Set(
      categories.slice(0, 8).flatMap((category) => category.image ? [category.image] : [])
    )];
    if (images.length > 0) {
      // Prefetch is optional: an image failure must not prevent category browsing.
      void Image.prefetch(images, "memory-disk").catch(() => {});
    }
  }, [categories]);

  return {
    categories,
    loading,
    error,
  };
}
