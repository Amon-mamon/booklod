import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminUserCreate,
  AdminUserPatch,
  AppSettings,
  PlanRow,
  UserListQuery,
} from "../admin-validation";
import { ApiError, fromDatabaseError } from "../http";
import { PLAN_COLUMNS, getSettings, toPlan, type Plan } from "./catalog";

// Every function here takes the service-role client. RLS does not apply, so
// every query is scoped explicitly by id. Callers must have passed requireAdmin.

const PROTECTED_PLAN = "starter";

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

export async function listUsers(admin: SupabaseClient, query: UserListQuery) {
  const { data, error } = await admin.rpc("admin_list_users", {
    p_search: query.search,
    p_limit: query.limit,
    p_offset: query.offset,
  });
  if (error) throw fromDatabaseError(error, "Unable to list users.");
  const rows = (data || []) as Record<string, unknown>[];
  const users: AdminUserSummary[] = rows.map((r) => ({
    id: String(r.id),
    email: String(r.email ?? ""),
    name: String(r.name ?? ""),
    createdAt: String(r.created_at),
    lastSignInAt: (r.last_sign_in_at as string | null) ?? null,
    planId: String(r.plan_id),
    status: String(r.status),
    currentPeriodEnd: (r.current_period_end as string | null) ?? null,
    source: String(r.source),
    isAdmin: r.is_admin === true,
    bookCount: Number(r.book_count ?? 0),
  }));
  const total = rows.length > 0 ? Number(rows[0].total_count ?? rows.length) : 0;
  return { users, total, limit: query.limit, offset: query.offset };
}

export async function getUser(admin: SupabaseClient, userId: string) {
  const { data: authData, error: authError } = await admin.auth.admin.getUserById(userId);
  if (authError || !authData?.user) throw new ApiError("not_found", "User not found.");
  const user = authData.user;

  const [profile, subscription, adminRow, library, plan] = await Promise.all([
    admin.from("profiles").select("data").eq("id", userId).maybeSingle(),
    admin
      .from("subscriptions")
      .select("plan_id, status, current_period_end, source, note, updated_by, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    admin.from("admins").select("user_id").eq("user_id", userId).maybeSingle(),
    admin.from("libraries").select("books, revision").eq("user_id", userId).maybeSingle(),
    admin.rpc("plan_for_user", { p_user_id: userId }),
  ]);
  for (const result of [profile, subscription, adminRow, library, plan]) {
    if (result.error) throw fromDatabaseError(result.error, "Unable to load that user.");
  }

  const data = (profile.data?.data || {}) as Record<string, unknown>;
  const sub = subscription.data as Record<string, unknown> | null;
  const books = Array.isArray(library.data?.books) ? library.data.books : [];

  return {
    id: user.id,
    email: user.email ?? "",
    provider: user.app_metadata?.provider ?? "email",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    name: typeof data.name === "string" ? data.name : "",
    isAdmin: Boolean(adminRow.data),
    bookCount: books.length,
    shareEnabled: data.shareEnabled === true,
    effectivePlan: plan.data,
    subscription: sub
      ? {
          planId: String(sub.plan_id),
          status: String(sub.status),
          currentPeriodEnd: (sub.current_period_end as string | null) ?? null,
          source: String(sub.source),
          note: String(sub.note ?? ""),
          updatedBy: (sub.updated_by as string | null) ?? null,
          updatedAt: String(sub.updated_at),
        }
      : null,
  };
}

async function requireAssignablePlan(admin: SupabaseClient, planId: string): Promise<Plan> {
  const { data, error } = await admin.from("plans").select(PLAN_COLUMNS).eq("id", planId).maybeSingle();
  if (error) throw fromDatabaseError(error, "Unable to load that plan.");
  if (!data) throw new ApiError("bad_request", `Plan "${planId}" does not exist.`);
  const plan = toPlan(data as Record<string, unknown>);
  if (plan.kind !== "plan") throw new ApiError("bad_request", "Add-ons can't be a user's plan.");
  return plan;
}

async function mergeProfileName(admin: SupabaseClient, userId: string, name: string) {
  const { data, error } = await admin.from("profiles").select("data").eq("id", userId).maybeSingle();
  if (error) throw fromDatabaseError(error, "Unable to load that profile.");
  const current = (data?.data || {}) as Record<string, unknown>;
  const next = { ...current, name, avatarInitial: (name || String(current.email || "B"))[0].toUpperCase() };
  const { error: writeError } = await admin.from("profiles").upsert({ id: userId, data: next }, { onConflict: "id" });
  if (writeError) throw fromDatabaseError(writeError, "Unable to save that profile.");
}

/** Unpublishes the user's shelf when their effective plan no longer allows sharing. */
async function enforceSharing(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin.rpc("plan_for_user", { p_user_id: userId });
  if (error) throw fromDatabaseError(error, "Unable to check that user's plan.");
  if ((data as { canShare?: boolean } | null)?.canShare) return;
  const { error: deleteError } = await admin.from("shared_shelves").delete().eq("owner_id", userId);
  if (deleteError) throw fromDatabaseError(deleteError, "Unable to unpublish that user's shelf.");
  const { error: stateError } = await admin.rpc("set_profile_share_state", {
    p_user_id: userId,
    p_enabled: false,
    p_code: null,
  });
  if (stateError) throw fromDatabaseError(stateError, "Unable to update that user's share state.");
}

async function writeSubscription(
  admin: SupabaseClient,
  actorId: string,
  userId: string,
  patch: NonNullable<AdminUserPatch["subscription"]>,
) {
  const { data: existing, error } = await admin
    .from("subscriptions")
    .select("plan_id, status, current_period_end, note")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw fromDatabaseError(error, "Unable to load that subscription.");

  const planId = patch.planId ?? (existing?.plan_id as string | undefined) ?? PROTECTED_PLAN;
  await requireAssignablePlan(admin, planId);

  const row = {
    user_id: userId,
    plan_id: planId,
    status: patch.status ?? existing?.status ?? "active",
    current_period_end:
      patch.currentPeriodEnd !== undefined ? patch.currentPeriodEnd : (existing?.current_period_end ?? null),
    note: patch.note ?? existing?.note ?? "",
    source: "admin",
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  };
  const { error: writeError } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
  if (writeError) throw fromDatabaseError(writeError, "Unable to save that subscription.");
  await enforceSharing(admin, userId);
}

export async function createUser(admin: SupabaseClient, actorId: string, input: AdminUserCreate) {
  if (input.planId) await requireAssignablePlan(admin, input.planId);

  const metadata = input.name ? { full_name: input.name } : undefined;
  const result = input.password
    ? await admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: metadata,
      })
    : await admin.auth.admin.inviteUserByEmail(input.email, { data: metadata });
  if (result.error || !result.data?.user) {
    const message = result.error?.message || "";
    if (/already|registered|exists/i.test(message)) throw new ApiError("conflict", "A user with that email already exists.");
    console.error("[api] admin create user failed", result.error);
    throw new ApiError("internal_error", "Unable to create that user.");
  }

  const userId = result.data.user.id;
  if (input.name) await mergeProfileName(admin, userId, input.name);
  if (input.planId) await writeSubscription(admin, actorId, userId, { planId: input.planId, status: "active" });
  return getUser(admin, userId);
}

export async function updateUser(admin: SupabaseClient, actorId: string, userId: string, patch: AdminUserPatch) {
  await getUser(admin, userId); // 404 if missing

  if (patch.isAdmin === false && userId === actorId) {
    throw new ApiError("bad_request", "You can't remove your own admin access.");
  }
  if (patch.name !== undefined) await mergeProfileName(admin, userId, patch.name);
  if (patch.subscription) await writeSubscription(admin, actorId, userId, patch.subscription);
  if (patch.isAdmin === true) {
    const { error } = await admin.from("admins").upsert({ user_id: userId }, { onConflict: "user_id" });
    if (error) throw fromDatabaseError(error, "Unable to grant admin access.");
  } else if (patch.isAdmin === false) {
    const { error } = await admin.from("admins").delete().eq("user_id", userId);
    if (error) throw fromDatabaseError(error, "Unable to remove admin access.");
  }
  return getUser(admin, userId);
}

/** Deletes the auth user; profiles, libraries, shelves and subscriptions cascade. */
export async function deleteUser(admin: SupabaseClient, actorId: string, userId: string) {
  if (userId === actorId) throw new ApiError("bad_request", "You can't delete your own account from the admin area.");
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    if (/not.?found/i.test(error.message || "")) throw new ApiError("not_found", "User not found.");
    console.error("[api] admin delete user failed", error);
    throw new ApiError("internal_error", "Unable to delete that user.");
  }
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
async function subscriberCount(admin: SupabaseClient, planId: string): Promise<number> {
  const { count, error } = await admin
    .from("subscriptions")
    .select("user_id", { count: "exact", head: true })
    .eq("plan_id", planId);
  if (error) throw fromDatabaseError(error, "Unable to count subscribers.");
  return count ?? 0;
}

export async function listAllPlans(admin: SupabaseClient) {
  const { data, error } = await admin.from("plans").select(PLAN_COLUMNS).order("sort_order", { ascending: true });
  if (error) throw fromDatabaseError(error, "Unable to load plans.");
  const plans = (data || []).map((row) => toPlan(row as Record<string, unknown>));
  const counts = await Promise.all(plans.map((p) => subscriberCount(admin, p.id)));
  return plans.map((plan, i) => ({ ...plan, subscriberCount: counts[i] }));
}

export async function getPlan(admin: SupabaseClient, planId: string) {
  const { data, error } = await admin.from("plans").select(PLAN_COLUMNS).eq("id", planId).maybeSingle();
  if (error) throw fromDatabaseError(error, "Unable to load that plan.");
  if (!data) throw new ApiError("not_found", "Plan not found.");
  return { ...toPlan(data as Record<string, unknown>), subscriberCount: await subscriberCount(admin, planId) };
}

export async function createPlan(admin: SupabaseClient, row: PlanRow) {
  const { error } = await admin.from("plans").insert(row);
  if (error) {
    if (error.code === "23505") throw new ApiError("conflict", `A plan with id "${row.id}" already exists.`);
    throw fromDatabaseError(error, "Unable to create that plan.");
  }
  return getPlan(admin, row.id!);
}

export async function updatePlan(admin: SupabaseClient, planId: string, row: PlanRow) {
  const current = await getPlan(admin, planId);
  if (planId === PROTECTED_PLAN && (row.is_active === false || row.kind === "addon")) {
    throw new ApiError("bad_request", "Starter is the default plan and must stay an active plan.");
  }
  if (row.kind === "addon" && current.subscriberCount > 0) {
    throw new ApiError("conflict", "Move this plan's subscribers to another plan before making it an add-on.");
  }
  const { error } = await admin
    .from("plans")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", planId);
  if (error) throw fromDatabaseError(error, "Unable to update that plan.");

  // Turning sharing off for a plan unpublishes its subscribers' shelves.
  if (row.can_share === false && current.canShare) {
    const { data: subs, error: subsError } = await admin.from("subscriptions").select("user_id").eq("plan_id", planId);
    if (subsError) throw fromDatabaseError(subsError, "Unable to load that plan's subscribers.");
    for (const { user_id } of subs || []) await enforceSharing(admin, String(user_id));
  }
  return getPlan(admin, planId);
}

export async function deletePlan(admin: SupabaseClient, planId: string) {
  if (planId === PROTECTED_PLAN) throw new ApiError("bad_request", "Starter is the default plan and can't be deleted.");
  const plan = await getPlan(admin, planId);
  if (plan.subscriberCount > 0) {
    throw new ApiError(
      "conflict",
      `${plan.subscriberCount} user(s) are on this plan. Move them to another plan, or deactivate the plan instead.`,
    );
  }
  const { error } = await admin.from("plans").delete().eq("id", planId);
  if (error) throw fromDatabaseError(error, "Unable to delete that plan.");
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function updateSettings(admin: SupabaseClient, actorId: string, patch: Partial<AppSettings>) {
  const now = new Date().toISOString();
  const rows = Object.entries(patch).map(([key, value]) => ({ key, value, updated_by: actorId, updated_at: now }));
  const { error } = await admin.from("app_settings").upsert(rows, { onConflict: "key" });
  if (error) throw fromDatabaseError(error, "Unable to save settings.");
  return getSettings(admin);
}
