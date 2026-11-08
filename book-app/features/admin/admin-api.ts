import { apiFetch } from "../shared/api-client";

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
  source: string;
  isAdmin: boolean;
  bookCount: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  name: string;
  isAdmin: boolean;
  bookCount: number;
  shareEnabled: boolean;
  effectivePlan: { id: string; name: string } | null;
  subscription: {
    planId: string;
    status: string;
    currentPeriodEnd: string | null;
    source: string;
    note: string;
    updatedAt: string;
  } | null;
}

export interface AdminPlan {
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
  subscriberCount: number;
}

export interface AdminSettings {
  announcement_enabled: boolean;
  announcement_text: string;
  support_email: string;
  pricing_footnote: string;
}

const json = (body: unknown) => JSON.stringify(body);

export const adminApi = {
  listUsers: (search: string, limit: number, offset: number) =>
    apiFetch<{ users: AdminUserSummary[]; total: number }>(
      `/api/v1/admin/users?${new URLSearchParams({ search, limit: String(limit), offset: String(offset) })}`,
    ),
  getUser: (id: string) => apiFetch<{ user: AdminUserDetail }>(`/api/v1/admin/users/${encodeURIComponent(id)}`),
  createUser: (body: { email: string; password?: string; name?: string; planId?: string }) =>
    apiFetch<{ user: AdminUserDetail }>("/api/v1/admin/users", { method: "POST", body: json(body) }),
  updateUser: (id: string, body: Record<string, unknown>) =>
    apiFetch<{ user: AdminUserDetail }>(`/api/v1/admin/users/${encodeURIComponent(id)}`, { method: "PATCH", body: json(body) }),
  deleteUser: (id: string) => apiFetch<void>(`/api/v1/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listPlans: () => apiFetch<{ plans: AdminPlan[] }>("/api/v1/admin/plans"),
  createPlan: (body: Record<string, unknown>) =>
    apiFetch<{ plan: AdminPlan }>("/api/v1/admin/plans", { method: "POST", body: json(body) }),
  updatePlan: (id: string, body: Record<string, unknown>) =>
    apiFetch<{ plan: AdminPlan }>(`/api/v1/admin/plans/${encodeURIComponent(id)}`, { method: "PATCH", body: json(body) }),
  deletePlan: (id: string) => apiFetch<void>(`/api/v1/admin/plans/${encodeURIComponent(id)}`, { method: "DELETE" }),

  getSettings: () => apiFetch<{ settings: AdminSettings }>("/api/v1/admin/settings"),
  updateSettings: (body: Partial<AdminSettings>) =>
    apiFetch<{ settings: AdminSettings }>("/api/v1/admin/settings", { method: "PATCH", body: json(body) }),
};

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

/** "129" or "129.50" -> 12900 / 12950. Returns null if not a valid amount. */
export function inputToCents(value: string): number | null {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value.trim())) return null;
  return Math.round(Number(value) * 100);
}
