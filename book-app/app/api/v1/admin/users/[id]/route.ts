import { requireAdmin } from "../../../../../../lib/api/auth";
import { parseAdminUserPatch, parseUserId } from "../../../../../../lib/api/admin-validation";
import { handler, json, noContent, options, readJson } from "../../../../../../lib/api/http";
import { deleteUser, getUser, updateUser } from "../../../../../../lib/api/services/admin";

type Context = { params: Promise<{ id: string }> };

export const OPTIONS = options;

/** GET /api/v1/admin/users/:id */
export const GET = handler(async (request: Request, context: Context) => {
  const { admin } = await requireAdmin(request);
  const id = parseUserId((await context.params).id);
  return json({ user: await getUser(admin, id) });
});

/** PATCH /api/v1/admin/users/:id — { name?, isAdmin?, subscription?: { planId, status, currentPeriodEnd, note } } */
export const PATCH = handler(async (request: Request, context: Context) => {
  const { admin, user } = await requireAdmin(request);
  const id = parseUserId((await context.params).id);
  const patch = parseAdminUserPatch(await readJson(request));
  return json({ user: await updateUser(admin, user.id, id, patch) });
});

/** DELETE /api/v1/admin/users/:id — deletes the auth user and all their data. */
export const DELETE = handler(async (request: Request, context: Context) => {
  const { admin, user } = await requireAdmin(request);
  const id = parseUserId((await context.params).id);
  await deleteUser(admin, user.id, id);
  return noContent();
});
