import { router } from "expo-router";

import { clearAuthSession, getAccessToken } from "@/utils/authStorage";

let expiration: Promise<void> | null = null;

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
