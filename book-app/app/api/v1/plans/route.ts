import { createAnonClient } from "../../../../lib/api/auth";
import { handler, json, options } from "../../../../lib/api/http";
import { RATE_LIMITS, clientIp, rateLimit } from "../../../../lib/api/rate-limit";
import { listActivePlans } from "../../../../lib/api/services/catalog";

export const OPTIONS = options;

/** GET /api/v1/plans — public catalogue of active plans and add-ons. */
export const GET = handler(async (request: Request) => {
  await rateLimit(RATE_LIMITS.public, clientIp(request));
  return json({ plans: await listActivePlans(createAnonClient()) });
});
