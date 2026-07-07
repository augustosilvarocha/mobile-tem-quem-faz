import { BASE_URL, api } from "./api";
import { createMemoryCache } from "./memoryCache";

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

function getApiHost() {
  return BASE_URL.replace(/^https?:\/\//, "").split(":")[0];
}

function normalizeImageUrl(image: string | null) {
  if (!image) {
    return undefined;
  }

  const apiHost = getApiHost();

  return image
    .replace("://localhost:", `://${apiHost}:`)
    .replace("://127.0.0.1:", `://${apiHost}:`);
}

async function loadCategories(): Promise<Category[]> {
  const categories = await api<CategoryResponse[]>("/categories/");

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    image: normalizeImageUrl(category.image),
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
