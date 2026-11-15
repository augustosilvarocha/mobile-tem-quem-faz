import { api, apiPatch } from "./api";
import { getRequiredAccessToken } from "@/utils/authStorage";

export type UserProfile = { id: number; name: string; phone: string };
export async function getUserProfile(): Promise<UserProfile> {
  return api("/users/me/", await getRequiredAccessToken());
}
export async function updateUserProfile(name: string): Promise<UserProfile> {
  return apiPatch("/users/me/", { name: name.trim() }, await getRequiredAccessToken());
}
