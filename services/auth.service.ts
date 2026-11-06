import { apiPost } from "./api";

export async function requestOtp(phone: string): Promise<{ message: string }> {
  return apiPost("/auth/request-code/", { phone });
}

export type VerifyOtpResponse = {
  verified: boolean;
  account_exists: boolean;
  user_id?: number;
  user_name?: string;
  provider_id?: number;
  provider_name?: string;
  access?: string;
  refresh?: string;
};

export async function verifyOtp(
  phone: string,
  code: string,
  name?: string
): Promise<VerifyOtpResponse> {
  return apiPost("/auth/verify-code/", { phone, code, ...(name ? { name: name.trim() } : {}) });
}
