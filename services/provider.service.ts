import { BASE_URL, api, apiUpload } from "./api";

export type CreateProviderPayload = {
  phone: string;
  name: string;
  city: number;
  photoUri: string | null;
  description: string;
  categories: number[];
};

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

function getProvidersEndpoint(filter?: ProviderCityFilter) {
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

  if (!params.toString()) {
    return "/providers/";
  }

  return `/providers/?${params.toString()}`;
}

export async function getProviders(
  filter?: ProviderCityFilter
): Promise<Provider[]> {
  const providers = await api<Provider[]>(getProvidersEndpoint(filter));

  return providers.map(normalizeProvider);
}

export async function createProvider(
  payload: CreateProviderPayload
): Promise<Provider> {
  const formData = new FormData();

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

  const provider = await apiUpload<Provider>("/providers/", formData);

  return normalizeProvider(provider);
}
