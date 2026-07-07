export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  return phone.length === 11;
}