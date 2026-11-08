import { requireAdmin } from "../../../../../lib/api/auth";
import { parseSettingsPatch } from "../../../../../lib/api/admin-validation";
import { handler, json, options, readJson } from "../../../../../lib/api/http";
import { getSettings } from "../../../../../lib/api/services/catalog";
import { updateSettings } from "../../../../../lib/api/services/admin";

export const OPTIONS = options;

/** GET /api/v1/admin/settings */
export const GET = handler(async (request: Request) => {
  const { admin } = await requireAdmin(request);
  return json({ settings: await getSettings(admin) });
});

/** PATCH /api/v1/admin/settings — { announcement_enabled?, announcement_text?, support_email?, pricing_footnote? } */
export const PATCH = handler(async (request: Request) => {
  const { admin, user } = await requireAdmin(request);
  const patch = parseSettingsPatch(await readJson(request));
  return json({ settings: await updateSettings(admin, user.id, patch) });
});
