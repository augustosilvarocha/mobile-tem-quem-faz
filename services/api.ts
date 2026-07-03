const BASE_URL = "http://192.168.1.14:8000/api";

export async function api<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Erro ao realizar requisição");
  }

  return response.json();
}