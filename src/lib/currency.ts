import { CurrencyConfig } from "@/types";

// Timezone → country → currency mapping
// Covers major mobile-money markets in Africa + common defaults
const TIMEZONE_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  // Kenya
  "Africa/Nairobi": { code: "KES", symbol: "KSh", rate: 129 },
  // Ghana
  "Africa/Accra": { code: "GHS", symbol: "GH₵", rate: 15.2 },
  // Nigeria
  "Africa/Lagos": { code: "NGN", symbol: "₦", rate: 1620 },
  // Tanzania
  "Africa/Dar_es_Salaam": { code: "TZS", symbol: "TSh", rate: 2650 },
  // Uganda
  "Africa/Kampala": { code: "UGX", symbol: "USh", rate: 3720 },
  // Rwanda
  "Africa/Kigali": { code: "RWF", symbol: "RF", rate: 1350 },
  // Ethiopia
  "Africa/Addis_Ababa": { code: "ETB", symbol: "Br", rate: 57 },
  // South Africa
  "Africa/Johannesburg": { code: "ZAR", symbol: "R", rate: 18.5 },
  // Egypt
  "Africa/Cairo": { code: "EGP", symbol: "E£", rate: 49 },
  // Zambia
  "Africa/Lusaka": { code: "ZMW", symbol: "K", rate: 27 },
  // Mozambique
  "Africa/Maputo": { code: "MZN", symbol: "MT", rate: 63 },
  // UK
  "Europe/London": { code: "GBP", symbol: "£", rate: 0.79 },
  // EU timezones (sample)
  "Europe/Paris": { code: "EUR", symbol: "€", rate: 0.92 },
  "Europe/Berlin": { code: "EUR", symbol: "€", rate: 0.92 },
  "Europe/Amsterdam": { code: "EUR", symbol: "€", rate: 0.92 },
  // India
  "Asia/Kolkata": { code: "INR", symbol: "₹", rate: 83 },
};

export const USD_CONFIG: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  rate: 1,
};

export function detectCurrency(): CurrencyConfig {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_CURRENCY_MAP[tz] ?? USD_CONFIG;
  } catch {
    return USD_CONFIG;
  }
}

export function formatPrice(usdAmount: number, currency: CurrencyConfig): string {
  const amount = Math.round(usdAmount * currency.rate);
  // Use locale-aware number formatting for thousands separators
  const formatted = amount.toLocaleString();
  return `${currency.symbol}${formatted}`;
}
