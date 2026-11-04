export function sanitizeCpf(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(0, 11);
}

export function formatCpf(value: string): string {
  return sanitizeCpf(value)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function isValidCpf(value: string): boolean {
  if (!/^(?:[0-9]{11}|[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2})$/.test(value)) {
    return false;
  }
  const digits = sanitizeCpf(value);
  if (/^(\d)\1{10}$/.test(digits)) return false;
  for (const size of [9, 10]) {
    let total = 0;
    for (let index = 0; index < size; index++) {
      total += Number(digits[index]) * (size + 1 - index);
    }
    if (((total * 10) % 11) % 10 !== Number(digits[size])) return false;
  }
  return true;
}
