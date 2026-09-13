/**
 * Display-only price localisation.
 * Base prices in src/lib/plans.ts are USD. We detect the visitor's region from
 * their browser locale first, then refine it with an IP geolocation lookup so
 * prices match where the person actually is.
 */

import { useEffect, useState } from "react";

type CurrencyInfo = { code: string; rate: number; decimals?: number };

/** Approximate USD -> local rates, rounded to friendly retail values on display. */
const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: "USD", rate: 1 },
  NZD: { code: "NZD", rate: 1.65 },
  AUD: { code: "AUD", rate: 1.5 },
  EUR: { code: "EUR", rate: 0.92 },
  GBP: { code: "GBP", rate: 0.78 },
  CAD: { code: "CAD", rate: 1.36 },
  JPY: { code: "JPY", rate: 150, decimals: 0 },
  INR: { code: "INR", rate: 84 },
  SGD: { code: "SGD", rate: 1.34 },
  ZAR: { code: "ZAR", rate: 18 },
  CHF: { code: "CHF", rate: 0.88 },
  SEK: { code: "SEK", rate: 10.5 },
  NOK: { code: "NOK", rate: 10.8 },
  DKK: { code: "DKK", rate: 6.9 },
  PLN: { code: "PLN", rate: 3.95 },
  BRL: { code: "BRL", rate: 5.4 },
  MXN: { code: "MXN", rate: 18 },
  AED: { code: "AED", rate: 3.67 },
  HKD: { code: "HKD", rate: 7.8 },
  KRW: { code: "KRW", rate: 1350, decimals: 0 },
  CNY: { code: "CNY", rate: 7.2 },
  PHP: { code: "PHP", rate: 57 },
  IDR: { code: "IDR", rate: 15800, decimals: 0 },
  THB: { code: "THB", rate: 35 },
  MYR: { code: "MYR", rate: 4.5 },
  TRY: { code: "TRY", rate: 34 },
};

const EURO_COUNTRIES = [
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT",
  "LU", "LV", "MT", "NL", "PT", "SI", "SK",
];

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", NZ: "NZD", AU: "AUD", GB: "GBP", CA: "CAD", JP: "JPY", IN: "INR",
  SG: "SGD", ZA: "ZAR", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  BR: "BRL", MX: "MXN", AE: "AED", HK: "HKD", KR: "KRW", CN: "CNY", PH: "PHP",
  ID: "IDR", TH: "THB", MY: "MYR", TR: "TRY",
  ...Object.fromEntries(EURO_COUNTRIES.map((c) => [c, "EUR"])),
};

function detectRegion(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const locales = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
  for (const loc of locales) {
    try {
      const region = new Intl.Locale(loc).maximize().region;
      if (region && COUNTRY_CURRENCY[region]) return region;
    } catch {
      const parts = String(loc).split("-");
      const last = parts[parts.length - 1]?.toUpperCase();
      if (last && COUNTRY_CURRENCY[last]) return last;
    }
  }
  return undefined;
}

export function detectCurrency(): CurrencyInfo {
  const region = detectRegion();
  const code = (region && COUNTRY_CURRENCY[region]) || "USD";
  return CURRENCIES[code] ?? CURRENCIES.USD;
}

/** Round to a friendly retail value (x.99 for small amounts, whole for large). */
function charmRound(value: number, decimals: number) {
  if (decimals === 0) {
    if (value < 1000) return Math.round(value / 10) * 10;
    return Math.round(value / 100) * 100;
  }
  if (value < 100) {
    const n = Math.max(1, Math.round(value));
    return Number((n - 0.01).toFixed(2));
  }
  return Math.round(value / 5) * 5;
}

export function convertFromUsd(usd: number, currency = detectCurrency()) {
  if (usd === 0) return 0;
  const decimals = currency.decimals ?? 2;
  return charmRound(usd * currency.rate, decimals);
}

export function formatMoney(amount: number, currency = detectCurrency()) {
  const decimals = currency.decimals ?? 2;
  const showCents = decimals > 0 && !Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(
      typeof navigator !== "undefined" ? navigator.language : "en-US",
      {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: showCents ? decimals : 0,
        maximumFractionDigits: showCents ? decimals : 0,
      },
    ).format(amount);
  } catch {
    return `$${amount}`;
  }
}

/** Convert a USD base price and format it for display in one step. */
export function formatFromUsd(usd: number, currency = detectCurrency()) {
  return formatMoney(convertFromUsd(usd, currency), currency);
}
