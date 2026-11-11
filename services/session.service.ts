import { router } from "expo-router";

import { clearAuthSession, getAccessToken, getRefreshToken, saveTokens } from "@/utils/authStorage";
import { BASE_URL } from "./apiConfig";

let expiration: Promise<void> | null = null;
let renewal: Promise<string | null> | null = null;

export async function renewAuthSession(token: string): Promise<string | null> {
  if (renewal) return renewal;
  renewal = (async () => {
    const current = await getAccessToken();
    if (current !== token) return current;
    const refresh = await getRefreshToken();
    if (!refresh) {
      await expireAuthSession(token);
      return null;
    }
    const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      await expireAuthSession(token);
      return null;
    }
    if (!response.ok) throw new Error("Não foi possível renovar a sessão. Tente novamente.");
    const data = await response.json();
    if (typeof data.access !== "string") throw new Error("Resposta de sessão inválida.");
    // A logout or a new login may have happened while the request was running.
    if (await getAccessToken() !== token) return getAccessToken();
    await saveTokens(data.access, data.refresh ?? refresh);
    return data.access;
  })();
  try {
    return await renewal;
  } finally {
    renewal = null;
  }
}

export function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const { exp } = JSON.parse(atob(padded));
    return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function expireAuthSession(token: string): Promise<void> {
  if (expiration) return expiration;

  expiration = (async () => {
    if (await getAccessToken() !== token) return;
    await clearAuthSession();
    router.replace("/(auth)/login");
  })();

  try {
    await expiration;
  } finally {
    expiration = null;
  }
}
