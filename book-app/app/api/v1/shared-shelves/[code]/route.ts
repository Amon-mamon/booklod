import { createAnonClient } from "../../../../../lib/api/auth";
import { ApiError, handler, json, options } from "../../../../../lib/api/http";
import { RATE_LIMITS, clientIp, rateLimit } from "../../../../../lib/api/rate-limit";
import { loadSharedShelf } from "../../../../../lib/api/services/profile";
import { SHARE_CODE_PATTERN } from "../../../../../lib/api/validation";

type Context = { params: Promise<{ code: string }> };

export const OPTIONS = options;

/** GET /api/v1/shared-shelves/:code — public, invite-code-only shelf snapshot. */
export const GET = handler(async (request: Request, context: Context) => {
  await rateLimit(RATE_LIMITS.public, clientIp(request));
  const { code } = await context.params;
  if (!SHARE_CODE_PATTERN.test(code)) {
    throw new ApiError("bad_request", "Shelf codes are 32 letters and numbers.");
  }
  const shelf = await loadSharedShelf(createAnonClient(), code.toUpperCase());
  if (!shelf) throw new ApiError("not_found", "No shared shelf found for this code. Check it and try again.");
  return json({ shelf });
});
