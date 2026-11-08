import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { BooklodProfile } from "../../../features/shared/types";
import { createServiceClient, isServiceRoleConfigured } from "../auth";
import { ApiError, fromDatabaseError } from "../http";
import type { ProfilePatch } from "../validation";

const DEFAULT_NOTIFICATIONS = {
  readingReminders: true,
  bookUpdates: true,
  productUpdates: false,
};

/** Mirrors the default profile the web app creates on first sign-in. */
export function defaultProfile(user: User): BooklodProfile {
  const metadata = user.user_metadata || {};
  const provider = user.app_metadata?.provider || "email";
  const displayName: string = metadata.full_name || metadata.name || "";
  return {
    name: displayName || user.email?.split("@")[0] || "Booklod Reader",
    email: user.email || "",
    provider: provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Email",
    avatarInitial: (displayName || user.email || "B")[0].toUpperCase(),
    photoUrl: metadata.avatar_url || "",
    notifications: DEFAULT_NOTIFICATIONS,
    plan: "starter",
    shareEnabled: false,
    shareCode: "",
  };
}

export interface EffectivePlan {
  id: string;
  name: string;
  canShare: boolean;
  bookLimit: number | null;
}

const FALLBACK_PLAN: EffectivePlan = { id: "starter", name: "Starter", canShare: false, bookLimit: null };

/** The plan comes from public.subscriptions via my_plan(). profiles.data.plan is ignored. */
export async function getMyPlan(supabase: SupabaseClient): Promise<EffectivePlan> {
  const { data, error } = await supabase.rpc("my_plan");
  if (error) throw fromDatabaseError(error, "Unable to load your plan.");
  return toPlan(data);
}

function toPlan(data: unknown): EffectivePlan {
  if (!data || typeof data !== "object") return FALLBACK_PLAN;
  const raw = data as Record<string, unknown>;
  return {
    id: typeof raw.id === "string" ? raw.id : FALLBACK_PLAN.id,
    name: typeof raw.name === "string" ? raw.name : FALLBACK_PLAN.name,
    canShare: raw.canShare === true,
    bookLimit: typeof raw.bookLimit === "number" ? raw.bookLimit : null,
  };
}

function withPlan(profile: BooklodProfile, plan: EffectivePlan): BooklodProfile {
  return { ...profile, plan: plan.id, planName: plan.name, canShare: plan.canShare };
}

/** Server-owned fields are never written back into profiles.data. */
function storable(profile: BooklodProfile) {
  const { plan: _plan, planName: _planName, canShare: _canShare, ...rest } = profile;
  void _plan;
  void _planName;
  void _canShare;
  return rest;
}

async function writeProfile(supabase: SupabaseClient, userId: string, profile: BooklodProfile) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, data: storable(profile) }, { onConflict: "id" });
  if (error) throw fromDatabaseError(error, "Unable to save your profile.");
}

async function readStoredProfile(supabase: SupabaseClient, user: User): Promise<BooklodProfile> {
  const { data, error } = await supabase.from("profiles").select("data").eq("id", user.id).maybeSingle();
  if (error) throw fromDatabaseError(error, "Unable to load your profile.");

  const fallback = defaultProfile(user);
  if (!data?.data) {
    await writeProfile(supabase, user.id, fallback);
    return fallback;
  }
  return { ...fallback, ...(data.data as Partial<BooklodProfile>) };
}

/** Loads the profile (creating the default on first use) with the real plan applied. */
export async function getOrCreateProfile(supabase: SupabaseClient, user: User): Promise<BooklodProfile> {
  const [profile, plan] = await Promise.all([readStoredProfile(supabase, user), getMyPlan(supabase)]);
  return withPlan(profile, plan);
}

export async function updateProfile(
  supabase: SupabaseClient,
  user: User,
  patch: ProfilePatch,
): Promise<BooklodProfile> {
  const { plan: planId, ...fields } = patch;

  // Plan changes go through set_my_plan(): only self-service plans are
  // accepted, and dropping to a plan without sharing unpublishes the shelf.
  if (planId !== undefined) {
    const { error } = await supabase.rpc("set_my_plan", { p_plan_id: planId });
    if (error) throw fromDatabaseError(error, "Unable to change your plan.");
  }

  const current = await readStoredProfile(supabase, user);
  if (Object.keys(fields).length > 0) {
    const next: BooklodProfile = {
      ...current,
      ...fields,
      notifications: { ...current.notifications, ...fields.notifications },
    };
    if (fields.name !== undefined) {
      next.avatarInitial = (fields.name || current.email || "B")[0].toUpperCase();
    }
    await writeProfile(supabase, user.id, next);
    return withPlan(next, await getMyPlan(supabase));
  }
  return withPlan(current, await getMyPlan(supabase));
}

/**
 * Removes all Booklod data. When the server has the service-role key it also
 * deletes the Supabase auth user (required by the app stores); the foreign
 * keys cascade the rest.
 */
export async function deleteAccount(supabase: SupabaseClient, userId: string): Promise<{ authUserDeleted: boolean }> {
  if (isServiceRoleConfigured()) {
    const { error } = await createServiceClient().auth.admin.deleteUser(userId);
    if (error) {
      console.error("[api] auth user delete failed", error);
      throw new ApiError("internal_error", "Unable to delete your account. Please try again.");
    }
    return { authUserDeleted: true };
  }
  const results = await Promise.all([
    supabase.from("shared_shelves").delete().eq("owner_id", userId),
    supabase.from("libraries").delete().eq("user_id", userId),
    supabase.from("profiles").delete().eq("id", userId),
  ]);
  const failed = results.find(({ error }) => error);
  if (failed?.error) throw fromDatabaseError(failed.error, "Unable to delete your Booklod data.");
  return { authUserDeleted: false };
}

// ---------------------------------------------------------------------------
// Share Your Shelf. The plan check and snapshot are built in the database
// (publish_my_shelf), so neither this API nor a client can skip them.
// ---------------------------------------------------------------------------
export async function publishShelf(supabase: SupabaseClient, user: User): Promise<BooklodProfile> {
  const { error } = await supabase.rpc("publish_my_shelf");
  if (error) {
    if (error.code === "42501") throw new ApiError("forbidden", "Share Your Shelf is a Booklod Plus feature.");
    throw fromDatabaseError(error, "Unable to publish your shelf.");
  }
  return getOrCreateProfile(supabase, user);
}

export async function stopSharing(supabase: SupabaseClient, user: User): Promise<BooklodProfile> {
  const { error } = await supabase.rpc("unpublish_my_shelf");
  if (error) throw fromDatabaseError(error, "Unable to turn off shelf sharing.");
  return getOrCreateProfile(supabase, user);
}

export async function loadSharedShelf(supabase: SupabaseClient, code: string): Promise<unknown> {
  const { data, error } = await supabase.rpc("get_shared_shelf", { share_code: code });
  if (error) throw fromDatabaseError(error, "Unable to load that shared shelf.");
  return data || null;
}
