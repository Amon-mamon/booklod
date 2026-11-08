import { createAnonClient } from "../../../../lib/api/auth";
import { handler, json, options } from "../../../../lib/api/http";
import { RATE_LIMITS, clientIp, rateLimit } from "../../../../lib/api/rate-limit";
import { getSettings } from "../../../../lib/api/services/catalog";

export const OPTIONS = options;

/** GET /api/v1/settings — public app settings (announcement, support email, ...). */
export const GET = handler(async (request: Request) => {
  await rateLimit(RATE_LIMITS.public, clientIp(request));
  return json({ settings: await getSettings(createAnonClient()) });
});
