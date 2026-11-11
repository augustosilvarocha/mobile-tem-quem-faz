import { fetch as expoFetch } from "expo/fetch";
import { expireAuthSession, renewAuthSession } from "./session.service";
import { BASE_URL } from "./apiConfig";
export { BASE_URL } from "./apiConfig";

export class ApiError extends Error {
  constructor(message: string, public readonly fields: Record<string, unknown>, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
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

async function authenticatedFetch(
  endpoint: string,
  init: { method?: "POST" | "PATCH" | "DELETE"; headers?: Record<string, string>; body?: string | FormData },
  token?: string | null,
  upload = false
): Promise<Response> {
  const send = (access?: string | null) => (upload ? expoFetch : fetch)(`${BASE_URL}${endpoint}`, {
    ...init,
    headers: { ...init.headers, ...(access ? { Authorization: `Bearer ${access}` } : {}) },
  });
  let response = await send(token);
  if (response.status === 401 && token) {
    const access = await renewAuthSession(token);
    if (access) {
      response = await send(access);
      if (response.status === 401) await expireAuthSession(access);
    }
  }
  return response;
}

export async function api<T>(endpoint: string, accessToken?: string): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  }, accessToken);

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response, "Erro ao realizar requisicao"), {}, response.status);
  }

  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown, accessToken?: string): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  }, accessToken);

  const data = await parseJsonResponse(response);

  if (!response.ok) {
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
  const response = await authenticatedFetch(endpoint, {
    method: options.method ?? "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
  }, options.accessToken, true);

  if (!response.ok) {
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
  const response = await authenticatedFetch(endpoint, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  }, accessToken);

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response, "Erro ao excluir os dados"), {}, response.status);
  }
}
