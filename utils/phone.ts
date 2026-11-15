export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(phone: string): boolean {
  return phone.length === 11;
}

export function formatPhone(value: string): string {
  const digits = sanitizePhone(value).slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const number = digits.slice(2);
  return `(${digits.slice(0, 2)}) ${number.length > 5 ? `${number.slice(0, 5)}-${number.slice(5)}` : number}`;
}
