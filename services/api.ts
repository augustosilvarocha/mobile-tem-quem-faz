const DEFAULT_BASE_URL = "http://192.168.1.6:8000/api";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

async function parseJsonResponse(response: Response) {
  return response.json().catch(() => null);
}

function getParsedErrorMessage(data: any, fallback: string) {
  return data?.error || data?.detail || fallback;
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = await parseJsonResponse(response);

  return getParsedErrorMessage(data, fallback);
}

export const BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL
);

export async function api<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Erro ao realizar requisicao")
    );
  }

  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(getParsedErrorMessage(data, "Erro na requisicao"));
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
  const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    const errorBody = await response.text();
    console.log("Erro da API:", errorBody);
    throw new Error("Erro ao salvar prestador");
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
    const errorBody = await response.text();
    console.log("Erro da API:", errorBody);
    throw new Error("Erro ao excluir prestador");
  }
}
