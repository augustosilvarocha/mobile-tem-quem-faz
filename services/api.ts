import { fetch as expoFetch } from "expo/fetch";
import { expireAuthSession } from "./session.service";

const DEFAULT_BASE_URL = "http://192.168.1.6:8000/api";

export class ApiError extends Error {
  constructor(message: string, public readonly fields: Record<string, unknown>, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

async function parseJsonResponse(response: Response) {
  return response.json().catch(() => null);
}

function getParsedErrorMessage(data: any, fallback: string) {
  return data?.error || data?.detail || data?.cpf?.[0] || fallback;
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = await parseJsonResponse(response);

  return getParsedErrorMessage(data, fallback);
}

export const BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL
);

export async function api<T>(endpoint: string, accessToken?: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    if (response.status === 401 && accessToken) await expireAuthSession(accessToken);
    throw new ApiError(await getErrorMessage(response, "Erro ao realizar requisicao"), {}, response.status);
  }

  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown, accessToken?: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    if (response.status === 401 && accessToken) await expireAuthSession(accessToken);
    throw new ApiError(getParsedErrorMessage(data, "Erro na requisição"), data ?? {}, response.status);
  }

  return data as T;
}

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: {
    accessToken?: string | null;
    method?: "POST" | "PATCH";
  } = {}
): Promise<T> {
  const response = await expoFetch(`${BASE_URL}${endpoint}`, {
    method: options.method ?? "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 && options.accessToken) await expireAuthSession(options.accessToken);
    throw new Error(
      await getErrorMessage(response, "Erro ao salvar os dados")
    );
  }

  return response.json();
}

export async function apiDelete(
  endpoint: string,
  accessToken?: string | null
): Promise<void> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 && accessToken) await expireAuthSession(accessToken);
    throw new ApiError(await getErrorMessage(response, "Erro ao excluir os dados"), {}, response.status);
  }
}
