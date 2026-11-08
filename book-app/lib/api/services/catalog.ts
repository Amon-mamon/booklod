import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, SETTING_KEYS, type AppSettings, type SettingKey } from "../admin-validation";
import { fromDatabaseError } from "../http";

/** Public shape of a plan (camelCase). */
export interface Plan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: "one_time" | "month" | "year";
  bookLimit: number | null;
  canShare: boolean;
  selfService: boolean;
  isActive: boolean;
  sortOrder: number;
  features: string[];
  kind: "plan" | "addon";
}

export const PLAN_COLUMNS =
  "id, name, description, price_cents, currency, billing_interval, book_limit, can_share, self_service, is_active, sort_order, features, kind";

export function toPlan(row: Record<string, unknown>): Plan {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    priceCents: Number(row.price_cents ?? 0),
    currency: String(row.currency ?? "PHP"),
    billingInterval: (row.billing_interval as Plan["billingInterval"]) ?? "one_time",
    bookLimit: typeof row.book_limit === "number" ? row.book_limit : null,
    canShare: row.can_share === true,
    selfService: row.self_service === true,
    isActive: row.is_active !== false,
    sortOrder: Number(row.sort_order ?? 0),
    features: Array.isArray(row.features) ? row.features.filter((f): f is string => typeof f === "string") : [],
    kind: row.kind === "addon" ? "addon" : "plan",
  };
}

/** Active plans, readable by anyone (RLS only exposes is_active rows to clients). */
export async function listActivePlans(supabase: SupabaseClient): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw fromDatabaseError(error, "Unable to load plans.");
  return (data || []).map((row) => toPlan(row as Record<string, unknown>));
}

export function settingsFromRows(rows: { key: string; value: unknown }[]): AppSettings {
  const settings: AppSettings = { ...DEFAULT_SETTINGS };
  for (const { key, value } of rows) {
    if (!SETTING_KEYS.includes(key as SettingKey)) continue;
    const k = key as SettingKey;
    if (typeof value === typeof DEFAULT_SETTINGS[k]) (settings as Record<SettingKey, unknown>)[k] = value;
  }
  return settings;
}

export async function getSettings(supabase: SupabaseClient): Promise<AppSettings> {
  const { data, error } = await supabase.from("app_settings").select("key, value");
  if (error) throw fromDatabaseError(error, "Unable to load settings.");
  return settingsFromRows((data || []) as { key: string; value: unknown }[]);
}
