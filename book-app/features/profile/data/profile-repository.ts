import { getSupabaseClient } from "../../../lib/supabase/client";
import { apiFetch } from "../../shared/api-client";
import type { BooklodProfile } from "../../shared/types";

export interface EffectivePlan {
  id: string;
  name: string;
  canShare: boolean;
  bookLimit: number | null;
}

export interface PublicPlan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: "one_time" | "month" | "year";
  bookLimit: number | null;
  canShare: boolean;
  selfService: boolean;
  sortOrder: number;
  features: string[];
  kind: "plan" | "addon";
}

export interface AppSettings {
  announcement_enabled: boolean;
  announcement_text: string;
  support_email: string;
  pricing_footnote: string;
}

const FALLBACK_PLAN: EffectivePlan = { id: "starter", name: "Starter", canShare: false, bookLimit: null };

export async function loadProfile(userId: string): Promise<BooklodProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("data")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.data as BooklodProfile | undefined) || null;
}

/**
 * The plan is server-owned (public.subscriptions). Plan fields are stripped
 * before saving; the database ignores profiles.data.plan anyway.
 */
export async function saveProfile(userId: string, profile: BooklodProfile): Promise<void> {
  const { plan: _plan, planName: _planName, canShare: _canShare, shareEnabled: _se, shareCode: _sc, ...fields } = profile;
  void _plan;
  void _planName;
  void _canShare;
  void _se;
  void _sc;
  // Share state is owned by publish_my_shelf / set_my_plan / admin changes, so
  // keep whatever the database has instead of this tab's possibly stale copy.
  const supabase = getSupabaseClient();
  const { data: current, error: readError } = await supabase.from("profiles").select("data").eq("id", userId).maybeSingle();
  if (readError) throw readError;
  const stored = (current?.data || {}) as Partial<BooklodProfile>;
  const data = {
    ...fields,
    shareEnabled: stored.shareEnabled ?? false,
    shareCode: stored.shareCode ?? "",
  };
  const { error } = await supabase.from("profiles").upsert({ id: userId, data }, { onConflict: "id" });

  if (error) throw error;
}

function toEffectivePlan(data: unknown): EffectivePlan {
  if (!data || typeof data !== "object") return FALLBACK_PLAN;
  const raw = data as Record<string, unknown>;
  return {
    id: typeof raw.id === "string" ? raw.id : FALLBACK_PLAN.id,
    name: typeof raw.name === "string" ? raw.name : FALLBACK_PLAN.name,
    canShare: raw.canShare === true,
    bookLimit: typeof raw.bookLimit === "number" ? raw.bookLimit : null,
  };
}

export async function loadMyPlan(): Promise<EffectivePlan> {
  const { data, error } = await getSupabaseClient().rpc("my_plan");
  if (error) throw error;
  return toEffectivePlan(data);
}

/** Demo self-upgrade/downgrade. The database only allows self-service plans. */
export async function setMyPlan(planId: string): Promise<EffectivePlan> {
  const { data, error } = await getSupabaseClient().rpc("set_my_plan", { p_plan_id: planId });
  if (error) throw error;
  return toEffectivePlan(data);
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await getSupabaseClient().rpc("is_admin");
  return !error && data === true;
}

export function applyPlan(profile: BooklodProfile, plan: EffectivePlan): BooklodProfile {
  return { ...profile, plan: plan.id, planName: plan.name, canShare: plan.canShare };
}

export async function loadPlans(): Promise<PublicPlan[]> {
  const { data, error } = await getSupabaseClient()
    .from("plans")
    .select("id, name, description, price_cents, currency, billing_interval, book_limit, can_share, self_service, sort_order, features, kind")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    billingInterval: row.billing_interval,
    bookLimit: row.book_limit,
    canShare: row.can_share,
    selfService: row.self_service,
    sortOrder: row.sort_order,
    features: Array.isArray(row.features) ? row.features : [],
    kind: row.kind,
  }));
}

export async function loadSettings(): Promise<AppSettings> {
  const settings: AppSettings = {
    announcement_enabled: false,
    announcement_text: "",
    support_email: "",
    pricing_footnote: "",
  };
  const { data, error } = await getSupabaseClient().from("app_settings").select("key, value");
  if (error) throw error;
  for (const { key, value } of data || []) {
    if (key in settings && typeof value === typeof settings[key as keyof AppSettings]) {
      (settings as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return settings;
}

export function formatPrice(plan: Pick<PublicPlan, "priceCents" | "currency">): string {
  const amount = plan.priceCents / 100;
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: plan.currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${plan.currency} ${amount}`;
  }
}

export function intervalLabel(interval: PublicPlan["billingInterval"]): string {
  return interval === "month" ? "/month" : interval === "year" ? "/year" : "one-time";
}

// ---------------------------------------------------------------------------
// Share Your Shelf (Plus feature). The database checks the plan and builds
// the snapshot itself, so only titles/authors/status are ever published.
// ---------------------------------------------------------------------------
export async function publishMyShelf(): Promise<string> {
  const { data, error } = await getSupabaseClient().rpc("publish_my_shelf");
  if (error) throw error;
  return String(data);
}

export async function unpublishMyShelf(): Promise<void> {
  const { error } = await getSupabaseClient().rpc("unpublish_my_shelf");
  if (error) throw error;
}

export async function loadSharedShelf(code: string): Promise<unknown> {
  const { data, error } = await getSupabaseClient().rpc("get_shared_shelf", {
    share_code: code,
  });

  if (error) throw error;
  return data || null;
}

/**
 * Permanently removes the account. Goes through the API so the server can
 * also delete the Supabase auth user (needs SUPABASE_SERVICE_ROLE_KEY).
 * This does not affect the user's underlying Google/Apple account.
 */
export async function deleteAccount(): Promise<void> {
  await apiFetch("/api/v1/me", { method: "DELETE" });
}
