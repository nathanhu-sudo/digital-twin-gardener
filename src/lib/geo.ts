/** Turns a 2-letter country code into its flag emoji. */
export function flagFor(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 127397 + c.charCodeAt(0))
  );
}

export function locationLabel(
  city: string | null,
  region: string | null,
  country: string | null
): string {
  const parts = [city, region, country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown";
}
