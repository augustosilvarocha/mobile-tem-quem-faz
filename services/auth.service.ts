import { apiPost } from "./api";

export async function requestOtp(phone: string): Promise<{ message: string }> {
  return apiPost("/auth/request-code/", { phone });
}

export type VerifyOtpResponse = {
  verified: boolean;
  account_exists: boolean;
  provider_id?: number;
  provider_name?: string;
  access?: string;
  refresh?: string;
};

export async function verifyOtp(
  phone: string,
  code: string
): Promise<VerifyOtpResponse> {
  return apiPost("/auth/verify-code/", { phone, code });
}
