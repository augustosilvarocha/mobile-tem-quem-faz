import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const PROVIDER_ID_KEY = "provider_id";
const PROVIDER_NAME_KEY = "provider_name";

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function saveProviderName(name: string) {
  const providerName = name.trim();

  if (!providerName) {
    await SecureStore.deleteItemAsync(PROVIDER_NAME_KEY);
    return;
  }

  await SecureStore.setItemAsync(PROVIDER_NAME_KEY, providerName);
}

export async function saveProviderId(id: number | string) {
  const providerId = String(id).trim();

  if (!providerId) {
    await SecureStore.deleteItemAsync(PROVIDER_ID_KEY);
    return;
  }

  await SecureStore.setItemAsync(PROVIDER_ID_KEY, providerId);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRequiredAccessToken() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Sessao expirada. Faca login novamente.");
  }

  return accessToken;
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function getProviderName() {
  return SecureStore.getItemAsync(PROVIDER_NAME_KEY);
}

export async function getProviderId() {
  return SecureStore.getItemAsync(PROVIDER_ID_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearAuthSession() {
  await clearTokens();
  await SecureStore.deleteItemAsync(PROVIDER_ID_KEY);
  await SecureStore.deleteItemAsync(PROVIDER_NAME_KEY);
}
