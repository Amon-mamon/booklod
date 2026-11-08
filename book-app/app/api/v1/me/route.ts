import { checkIsAdmin, requireUser, requireUserForWrite } from "../../../../lib/api/auth";
import { handler, json, noContent, options, readJson } from "../../../../lib/api/http";
import { deleteAccount, getOrCreateProfile, updateProfile } from "../../../../lib/api/services/profile";
import { parseProfilePatch } from "../../../../lib/api/validation";

export const OPTIONS = options;

/** GET /api/v1/me — the signed-in user's profile (created on first call). */
export const GET = handler(async (request: Request) => {
  const { user, supabase } = await requireUser(request);
  const [profile, isAdmin] = await Promise.all([getOrCreateProfile(supabase, user), checkIsAdmin(supabase)]);
  return json({ user: { id: user.id, email: user.email ?? "" }, profile, isAdmin });
});

/** PATCH /api/v1/me — update name, photoUrl, notifications, or switch to a self-service plan. */
export const PATCH = handler(async (request: Request) => {
  const { user, supabase } = await requireUserForWrite(request);
  const patch = parseProfilePatch(await readJson(request));
  const profile = await updateProfile(supabase, user, patch);
  return json({ profile });
});

/** DELETE /api/v1/me — permanently delete the account (auth user too, when the server can). */
export const DELETE = handler(async (request: Request) => {
  const { user, supabase } = await requireUserForWrite(request);
  await deleteAccount(supabase, user.id);
  return noContent();
});
