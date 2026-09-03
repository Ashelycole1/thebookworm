export function normalizeWhatsAppLink(rawValue?: string | null): string {
  const value = (rawValue ?? "").trim();

  if (!value) {
    return "https://wa.me/15551234567";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const digits = value.replace(/\D+/g, "");

  if (!digits) {
    return "https://wa.me/15551234567";
  }

  return `https://wa.me/${digits}`;
}
