export const BASE_URL = "http://192.168.1.3:8000/api";

export async function api<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Erro ao realizar requisição");
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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || "Erro na requisição";
    throw new Error(message);
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
