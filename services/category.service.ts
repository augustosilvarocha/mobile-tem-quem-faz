import { api } from "./api";
import { createMemoryCache } from "./memoryCache";
import { normalizeRemoteImageUrl } from "./mediaUrl";

export type Category = {
  id: number;
  name: string;
  image?: string;
};

type CategoryResponse = {
  id: number;
  name: string;
  image: string | null;
};

const categoriesCache = createMemoryCache<Category[]>();

async function loadCategories(): Promise<Category[]> {
  const categories = await api<CategoryResponse[]>("/categories/");

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    image: normalizeRemoteImageUrl(category.image) ?? undefined,
  }));
}

export function getCachedCategories() {
  return categoriesCache.getCached();
}

export function clearCategoriesCache() {
  categoriesCache.clear();
}

export async function getCategories(): Promise<Category[]> {
  return categoriesCache.get(loadCategories);
}
