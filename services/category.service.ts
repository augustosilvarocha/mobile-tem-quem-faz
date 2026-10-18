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

async function loadCategories(search?: string): Promise<Category[]> {
  const endpoint = search
    ? `/categories/?search=${encodeURIComponent(search)}`
    : "/categories/";
  const categories = await api<CategoryResponse[]>(endpoint);

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

export async function searchCategories(text: string): Promise<Category[]> {
  const query = text.trim();

  return query ? loadCategories(query) : [];
}
