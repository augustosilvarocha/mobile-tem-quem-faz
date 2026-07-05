import { BASE_URL, api } from "./api";

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

export async function getCategories(): Promise<Category[]> {
  const categories = await api<CategoryResponse[]>("/categories/");

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    image: normalizeImageUrl(category.image),
  }));
}
