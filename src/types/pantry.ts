export type StorageLocation = "fridge" | "freezer" | "pantry";

export interface PantryItem {
  id: string;
  name: string;
  weightKg: number;
  shelfLifeDays: number;
  co2Impact: "high" | "medium" | "low";
  addedAt: string; // ISO date
  status: "active" | "consumed" | "tossed";
  location: StorageLocation;
}

export interface GreenImpact {
  savedKg: number;
  wastedKg: number;
  co2SavedKg: number;
  co2WastedKg: number;
  moneySavedUsd: number;
  moneyWastedUsd: number;
}

export const CO2_MULTIPLIERS: Record<string, number> = {
  high: 27.0,    // kg CO2 per kg food (e.g. beef)
  medium: 3.2,   // kg CO2 per kg food (e.g. dairy, bread)
  low: 0.9,      // kg CO2 per kg food (e.g. vegetables)
};

/** Rough average grocery price per kg (USD) by food category — used for estimates only. */
export const PRICE_PER_KG_USD: Record<string, number> = {
  high: 15,   // meat
  medium: 6,  // dairy, bread, eggs
  low: 4,     // fruit & veg, grains
};

export const LOCATION_LABELS: Record<StorageLocation, string> = {
  fridge: "🧊 Fridge",
  freezer: "❄️ Freezer",
  pantry: "🥫 Pantry",
};

export const SCANNABLE_ITEMS: Omit<PantryItem, "id" | "addedAt" | "status" | "location">[] = [
  { name: "Milk", weightKg: 1.0, shelfLifeDays: 7, co2Impact: "medium" },
  { name: "Spinach", weightKg: 0.2, shelfLifeDays: 5, co2Impact: "low" },
  { name: "Bread", weightKg: 0.6, shelfLifeDays: 4, co2Impact: "medium" },
  { name: "Beef Mince", weightKg: 0.5, shelfLifeDays: 3, co2Impact: "high" },
];
