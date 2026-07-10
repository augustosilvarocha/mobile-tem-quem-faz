import { BASE_URL, api, apiDelete, apiPost, apiUpload } from "./api";
import { createKeyedMemoryCache } from "./memoryCache";
import { getAccessToken } from "@/utils/authStorage";

export type CreateProviderPayload = {
  phone: string;
  name: string;
  city: number;
  photoUri: string | null;
  description: string;
  categories: number[];
};

export type UpdateProviderPayload = CreateProviderPayload;

export type Provider = {
  id: number;
  user: {
    id: number;
    phone: string;
    created_at: string;
  };
  name: string;
  city: number;
  city_name: string;
  state_name: string;
  uf: string;
  photo: string | null;
  description: string;
  categories: number[];
  category_names?: string[];
  created_at: string;
  access?: string;
  refresh?: string;
};

export type ProviderCityFilter = {
  city?: string;
  state?: string;
  uf?: string;
};

export type ProviderFilter = ProviderCityFilter & {
  category?: string;
};

const PROVIDERS_CACHE_TTL_MS = 5 * 60 * 1000;
const providersCache = createKeyedMemoryCache<Provider[]>();
const providerDetailsCache = createKeyedMemoryCache<Provider>();

function getApiHost() {
  return BASE_URL.replace(/^https?:\/\//, "").split(":")[0];
}

function getApiOrigin() {
  return BASE_URL.replace(/\/api\/?$/, "");
}

function normalizePhotoUrl(photo: string | null) {
  if (!photo) {
    return null;
  }

  if (photo.startsWith("/")) {
    return `${getApiOrigin()}${photo}`;
  }

  const apiHost = getApiHost();

  return photo
    .replace("://localhost:", `://${apiHost}:`)
    .replace("://127.0.0.1:", `://${apiHost}:`)
    .replace("://0.0.0.0:", `://${apiHost}:`)
    .replace("://minio:", `://${apiHost}:`);
}

function normalizeProvider(provider: Provider): Provider {
  return {
    ...provider,
    photo: normalizePhotoUrl(provider.photo),
  };
}

function getProvidersEndpoint(filter?: ProviderFilter) {
  if (!filter) {
    return "/providers/";
  }

  const params = new URLSearchParams();

  if (filter.city) {
    params.append("city", filter.city);
  }

  if (filter.uf) {
    params.append("uf", filter.uf);
  }

  if (filter.state) {
    params.append("state", filter.state);
  }

  if (filter.category) {
    params.append("categories", filter.category);
  }

  if (!params.toString()) {
    return "/providers/";
  }

  return `/providers/?${params.toString()}`;
}

export async function getProviders(
  filter?: ProviderFilter
): Promise<Provider[]> {
  const endpoint = getProvidersEndpoint(filter);

  return providersCache.get(
    endpoint,
    async () => {
      const providers = await api<Provider[]>(endpoint);

      return providers.map(normalizeProvider);
    },
    {
      ttlMs: PROVIDERS_CACHE_TTL_MS,
    }
  );
}

export async function searchProviders(text: string): Promise<Provider[]> {
  const searchText = text.trim();

  if (!searchText) {
    return [];
  }

  try {
    const providers = await apiPost<Provider[]>("/search/", {
      text: searchText,
    });

    return providers.map(normalizeProvider);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("categoria")
    ) {
      return [];
    }

    throw error;
  }
}

export function getCachedProviders(filter?: ProviderFilter) {
  return providersCache.getCached(getProvidersEndpoint(filter), {
    ttlMs: PROVIDERS_CACHE_TTL_MS,
  });
}

export function clearProvidersCache() {
  providersCache.clear();
  providerDetailsCache.clear();
}

export async function getProviderById(providerId: number | string): Promise<Provider> {
  const endpoint = `/providers/${providerId}/`;

  return providerDetailsCache.get(
    endpoint,
    async () => {
      const provider = await api<Provider>(endpoint);

      return normalizeProvider(provider);
    },
    {
      ttlMs: PROVIDERS_CACHE_TTL_MS,
    }
  );
}

export async function createProvider(
  payload: CreateProviderPayload
): Promise<Provider> {
  const formData = new FormData();

  appendProviderFormData(formData, payload);

  const provider = await apiUpload<Provider>("/providers/", formData);

  clearProvidersCache();

  return normalizeProvider(provider);
}

function appendProviderFormData(
  formData: FormData,
  payload: CreateProviderPayload
) {
  formData.append("user.phone", payload.phone);
  formData.append("name", payload.name);
  formData.append("city", String(payload.city));
  formData.append("description", payload.description);

  payload.categories.forEach((categoryId) => {
    formData.append("categories", String(categoryId));
  });

  if (payload.photoUri) {
    const fileName = payload.photoUri.split("/").pop() ?? "photo.jpg";
    const extension = fileName.split(".").pop()?.toLowerCase();
    const mimeType = extension === "png" ? "image/png" : "image/jpeg";

    formData.append("photo", {
      uri: payload.photoUri,
      name: fileName,
      type: mimeType,
    } as any);
  }
}

export async function updateProvider(
  providerId: number | string,
  payload: UpdateProviderPayload
): Promise<Provider> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  const formData = new FormData();

  appendProviderFormData(formData, payload);

  const provider = await apiUpload<Provider>(
    `/providers/${providerId}/`,
    formData,
    {
      accessToken,
      method: "PATCH",
    }
  );

  clearProvidersCache();

  return normalizeProvider(provider);
}

export async function deleteProvider(providerId: number | string): Promise<void> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  await apiDelete(`/providers/${providerId}/`, accessToken);

  clearProvidersCache();
}
