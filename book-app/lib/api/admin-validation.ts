import { ApiError } from "./http";
import { PLAN_ID_PATTERN } from "./validation";

function bad(message: string): never {
  throw new ApiError("bad_request", message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(input: Record<string, unknown>, key: string, max: number, min = 0): string | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") bad(`"${key}" must be a string.`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) bad(`"${key}" must be ${min}-${max} characters.`);
  return trimmed;
}

function bool(input: Record<string, unknown>, key: string): boolean | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") bad(`"${key}" must be true or false.`);
  return value;
}

function int(input: Record<string, unknown>, key: string, min: number, max: number): number | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    bad(`"${key}" must be a whole number from ${min} to ${max}.`);
  }
  return value;
}

function oneOf<T extends string>(input: Record<string, unknown>, key: string, allowed: readonly T[]): T | undefined {
  const value = input[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !allowed.includes(value as T)) bad(`"${key}" must be one of: ${allowed.join(", ")}.`);
  return value as T;
}

function requireObject(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) bad("Request body must be a JSON object.");
  return input;
}

function nonEmpty<T extends object>(patch: T, allowed: string): T {
  if (Object.keys(patch).length === 0) bad(`Nothing to update. Allowed fields: ${allowed}.`);
  return patch;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUserId(id: string): string {
  if (!USER_ID_PATTERN.test(id)) bad("Invalid user id.");
  return id.toLowerCase();
}

export function parsePlanId(id: string): string {
  if (!PLAN_ID_PATTERN.test(id)) bad("Plan ids are 2-40 lowercase letters, digits, - or _.");
  return id;
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
export const BILLING_INTERVALS = ["one_time", "month", "year"] as const;
export const PLAN_KINDS = ["plan", "addon"] as const;

/** Columns of public.plans an admin may write (snake_case, ready for upsert). */
export interface PlanRow {
  id?: string;
  name?: string;
  description?: string;
  price_cents?: number;
  currency?: string;
  billing_interval?: (typeof BILLING_INTERVALS)[number];
  book_limit?: number | null;
  can_share?: boolean;
  self_service?: boolean;
  is_active?: boolean;
  sort_order?: number;
  features?: string[];
  kind?: (typeof PLAN_KINDS)[number];
}

const PLAN_FIELDS =
  "name, description, priceCents, currency, billingInterval, bookLimit, canShare, selfService, isActive, sortOrder, features, kind";

export function parsePlanInput(raw: unknown, mode: "create" | "update"): PlanRow {
  const input = requireObject(raw);
  const row: PlanRow = {};

  if (mode === "create") {
    const id = str(input, "id", 40, 2);
    if (!id) bad("\"id\" is required.");
    row.id = parsePlanId(id);
    if (input.name === undefined) bad("\"name\" is required.");
  }

  const name = str(input, "name", 80, 1);
  if (name !== undefined) row.name = name;
  const description = str(input, "description", 1000);
  if (description !== undefined) row.description = description;
  const price = int(input, "priceCents", 0, 100_000_000);
  if (price !== undefined) row.price_cents = price;
  const currency = str(input, "currency", 3, 3);
  if (currency !== undefined) {
    if (!/^[A-Z]{3}$/.test(currency)) bad("\"currency\" must be a 3-letter code like PHP.");
    row.currency = currency;
  }
  const interval = oneOf(input, "billingInterval", BILLING_INTERVALS);
  if (interval !== undefined) row.billing_interval = interval;
  if (input.bookLimit === null) row.book_limit = null;
  else {
    const limit = int(input, "bookLimit", 1, 5000);
    if (limit !== undefined) row.book_limit = limit;
  }
  const canShare = bool(input, "canShare");
  if (canShare !== undefined) row.can_share = canShare;
  const selfService = bool(input, "selfService");
  if (selfService !== undefined) row.self_service = selfService;
  const isActive = bool(input, "isActive");
  if (isActive !== undefined) row.is_active = isActive;
  const sortOrder = int(input, "sortOrder", -1000, 1000);
  if (sortOrder !== undefined) row.sort_order = sortOrder;
  const kind = oneOf(input, "kind", PLAN_KINDS);
  if (kind !== undefined) row.kind = kind;

  if (input.features !== undefined) {
    if (!Array.isArray(input.features) || input.features.length > 20) bad("\"features\" must be a list of at most 20 items.");
    row.features = input.features.map((item, i) => {
      if (typeof item !== "string" || !item.trim() || item.length > 200) bad(`features[${i}] must be 1-200 characters.`);
      return item.trim();
    });
  }

  return mode === "update" ? nonEmpty(row, PLAN_FIELDS) : row;
}

// ---------------------------------------------------------------------------
// Users and subscriptions
// ---------------------------------------------------------------------------
export const SUBSCRIPTION_STATUSES = ["active", "canceled", "past_due"] as const;

export interface AdminUserCreate {
  email: string;
  password?: string;
  name?: string;
  planId?: string;
}

export function parseAdminUserCreate(raw: unknown): AdminUserCreate {
  const input = requireObject(raw);
  const email = str(input, "email", 254, 3)?.toLowerCase();
  if (!email || !EMAIL.test(email)) bad("A valid \"email\" is required.");
  const result: AdminUserCreate = { email };
  const password = input.password;
  if (password !== undefined && password !== "") {
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      bad("\"password\" must be 8-72 characters, or leave it empty to send an invite email.");
    }
    result.password = password;
  }
  const name = str(input, "name", 100);
  if (name) result.name = name;
  const planId = str(input, "planId", 40);
  if (planId) result.planId = parsePlanId(planId);
  return result;
}

export interface AdminUserPatch {
  name?: string;
  isAdmin?: boolean;
  subscription?: {
    planId?: string;
    status?: (typeof SUBSCRIPTION_STATUSES)[number];
    currentPeriodEnd?: string | null;
    note?: string;
  };
}

export function parseAdminUserPatch(raw: unknown): AdminUserPatch {
  const input = requireObject(raw);
  const patch: AdminUserPatch = {};

  const name = str(input, "name", 100);
  if (name !== undefined) patch.name = name;
  const isAdmin = bool(input, "isAdmin");
  if (isAdmin !== undefined) patch.isAdmin = isAdmin;

  if (input.subscription !== undefined) {
    const sub = requireObject(input.subscription);
    const out: NonNullable<AdminUserPatch["subscription"]> = {};
    const planId = str(sub, "planId", 40);
    if (planId !== undefined) out.planId = parsePlanId(planId);
    const status = oneOf(sub, "status", SUBSCRIPTION_STATUSES);
    if (status !== undefined) out.status = status;
    if (sub.currentPeriodEnd === null || sub.currentPeriodEnd === "") out.currentPeriodEnd = null;
    else if (sub.currentPeriodEnd !== undefined) {
      const value = sub.currentPeriodEnd;
      const date = typeof value === "string" ? new Date(value) : null;
      if (!date || Number.isNaN(date.getTime())) bad("\"subscription.currentPeriodEnd\" must be a date or null.");
      out.currentPeriodEnd = date.toISOString();
    }
    const note = str(sub, "note", 1000);
    if (note !== undefined) out.note = note;
    if (Object.keys(out).length > 0) patch.subscription = out;
  }

  return nonEmpty(patch, "name, isAdmin, subscription { planId, status, currentPeriodEnd, note }");
}

export interface UserListQuery {
  search: string;
  limit: number;
  offset: number;
}

export function parseUserListQuery(params: URLSearchParams): UserListQuery {
  const search = (params.get("search") || "").trim();
  if (search.length > 100) bad("\"search\" must be at most 100 characters.");
  const limit = Number(params.get("limit") || 50);
  const offset = Number(params.get("offset") || 0);
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) bad("\"limit\" must be 1-200.");
  if (!Number.isInteger(offset) || offset < 0 || offset > 1_000_000) bad("\"offset\" must be 0 or more.");
  // Escape LIKE wildcards so the search is literal.
  return { search: search.replace(/[\\%_]/g, (c) => `\\${c}`), limit, offset };
}

// ---------------------------------------------------------------------------
// App settings
// ---------------------------------------------------------------------------
export const SETTING_KEYS = ["announcement_enabled", "announcement_text", "support_email", "pricing_footnote"] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export type AppSettings = {
  announcement_enabled: boolean;
  announcement_text: string;
  support_email: string;
  pricing_footnote: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  announcement_enabled: false,
  announcement_text: "",
  support_email: "",
  pricing_footnote: "",
};

export function parseSettingsPatch(raw: unknown): Partial<AppSettings> {
  const input = requireObject(raw);
  const patch: Partial<AppSettings> = {};
  for (const key of Object.keys(input)) {
    if (!SETTING_KEYS.includes(key as SettingKey)) bad(`Unknown setting "${key}".`);
  }
  const enabled = bool(input, "announcement_enabled");
  if (enabled !== undefined) patch.announcement_enabled = enabled;
  const text = str(input, "announcement_text", 280);
  if (text !== undefined) patch.announcement_text = text;
  const email = str(input, "support_email", 254);
  if (email !== undefined) {
    if (email && !EMAIL.test(email)) bad("\"support_email\" must be an email address or empty.");
    patch.support_email = email;
  }
  const footnote = str(input, "pricing_footnote", 500);
  if (footnote !== undefined) patch.pricing_footnote = footnote;
  return nonEmpty(patch, SETTING_KEYS.join(", "));
}
