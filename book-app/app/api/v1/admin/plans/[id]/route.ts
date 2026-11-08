import { requireAdmin } from "../../../../../../lib/api/auth";
import { parsePlanId, parsePlanInput } from "../../../../../../lib/api/admin-validation";
import { handler, json, noContent, options, readJson } from "../../../../../../lib/api/http";
import { deletePlan, getPlan, updatePlan } from "../../../../../../lib/api/services/admin";

type Context = { params: Promise<{ id: string }> };

export const OPTIONS = options;

/** GET /api/v1/admin/plans/:id */
export const GET = handler(async (request: Request, context: Context) => {
  const { admin } = await requireAdmin(request);
  return json({ plan: await getPlan(admin, parsePlanId((await context.params).id)) });
});

/** PATCH /api/v1/admin/plans/:id — e.g. { priceCents: 12900 } to raise a price. */
export const PATCH = handler(async (request: Request, context: Context) => {
  const { admin } = await requireAdmin(request);
  const id = parsePlanId((await context.params).id);
  const row = parsePlanInput(await readJson(request), "update");
  return json({ plan: await updatePlan(admin, id, row) });
});

/** DELETE /api/v1/admin/plans/:id — refused while the plan has subscribers. */
export const DELETE = handler(async (request: Request, context: Context) => {
  const { admin } = await requireAdmin(request);
  await deletePlan(admin, parsePlanId((await context.params).id));
  return noContent();
});
