import { api, apiDelete, apiPost, apiUpload } from "./api";
import { createKeyedMemoryCache } from "./memoryCache";
import { normalizeRemoteImageUrl } from "./mediaUrl";
import { getAccessToken } from "@/utils/authStorage";
import { File } from "expo-file-system";

export type CreateProviderPayload = {
  phone: string;
  name: string;
  city: number;
  photoUri: string | null;
  description: string;
  categories: number[];
  neighborhood?: string;
  street?: string;
  number?: string;
  address_complement?: string;
  reference_point?: string;
  latitude?: number | null;
  longitude?: number | null;
  show_location_on_map?: boolean;
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
  neighborhood: string | null;
  street: string | null;
  number: string | null;
  address_complement: string | null;
  reference_point: string | null;
  latitude: number | null;
  longitude: number | null;
  show_location_on_map: boolean;
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

function normalizePhotoUrl(photo: string | null) {
  return normalizeRemoteImageUrl(photo);
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

function appendOptionalFormField(
  formData: FormData,
  fieldName: string,
  value?: string | number | boolean | null
) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  formData.append(fieldName, String(value));
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
  appendOptionalFormField(formData, "name", payload.name);
  appendOptionalFormField(formData, "user.phone", payload.phone);
  appendOptionalFormField(formData, "city", payload.city);
  appendOptionalFormField(formData, "description", payload.description);
  appendOptionalFormField(formData, "neighborhood", payload.neighborhood);
  appendOptionalFormField(formData, "street", payload.street);
  appendOptionalFormField(formData, "number", payload.number);
  appendOptionalFormField(
    formData,
    "address_complement",
    payload.address_complement
  );
  appendOptionalFormField(formData, "reference_point", payload.reference_point);
  appendOptionalFormField(formData, "latitude", payload.latitude);
  appendOptionalFormField(formData, "longitude", payload.longitude);

  formData.append(
    "show_location_on_map",
    payload.show_location_on_map ? "true" : "false"
  );

  payload.categories.forEach((categoryId) => {
    formData.append("categories", String(categoryId));
  });

  if (payload.photoUri) {
    const photoFile = new File(payload.photoUri);

    formData.append("photo", photoFile, photoFile.name);
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
