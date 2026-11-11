export const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.6:8000/api"
).replace(/\/+$/, "");
