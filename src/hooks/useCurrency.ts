"use client";

import { useState, useEffect } from "react";
import { CurrencyConfig } from "@/types";
import { detectCurrency, USD_CONFIG } from "@/lib/currency";

export function useCurrency(): CurrencyConfig {
  const [currency, setCurrency] = useState<CurrencyConfig>(USD_CONFIG);

  useEffect(() => {
    // eslint-disable-next-line
    setCurrency(detectCurrency());
  }, []);

  return currency;
}
