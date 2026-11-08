import { requireAdmin } from "../../../../../lib/api/auth";
import { parseAdminUserCreate, parseUserListQuery } from "../../../../../lib/api/admin-validation";
import { handler, json, options, readJson } from "../../../../../lib/api/http";
import { createUser, listUsers } from "../../../../../lib/api/services/admin";

export const OPTIONS = options;

/** GET /api/v1/admin/users?search=&limit=&offset= */
export const GET = handler(async (request: Request) => {
  const { admin } = await requireAdmin(request);
  const query = parseUserListQuery(new URL(request.url).searchParams);
  return json(await listUsers(admin, query));
});

/** POST /api/v1/admin/users — { email, password?, name?, planId? }. No password sends an invite email. */
export const POST = handler(async (request: Request) => {
  const { admin, user } = await requireAdmin(request);
  const input = parseAdminUserCreate(await readJson(request));
  return json({ user: await createUser(admin, user.id, input) }, 201);
});
