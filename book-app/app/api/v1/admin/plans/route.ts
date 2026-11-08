import { requireAdmin } from "../../../../../lib/api/auth";
import { parsePlanInput } from "../../../../../lib/api/admin-validation";
import { handler, json, options, readJson } from "../../../../../lib/api/http";
import { createPlan, listAllPlans } from "../../../../../lib/api/services/admin";

export const OPTIONS = options;

/** GET /api/v1/admin/plans — all plans (inactive too) with subscriber counts. */
export const GET = handler(async (request: Request) => {
  const { admin } = await requireAdmin(request);
  return json({ plans: await listAllPlans(admin) });
});

/** POST /api/v1/admin/plans */
export const POST = handler(async (request: Request) => {
  const { admin } = await requireAdmin(request);
  const row = parsePlanInput(await readJson(request), "create");
  return json({ plan: await createPlan(admin, row) }, 201);
});
