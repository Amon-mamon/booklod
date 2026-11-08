import { requireUser } from "../../../../../lib/api/auth";
import { ApiError, handler, json, options } from "../../../../../lib/api/http";
import { RATE_LIMITS, rateLimit } from "../../../../../lib/api/rate-limit";
import { listEditions, WORK_KEY_PATTERN } from "../../../../../lib/api/services/openlibrary";

export const OPTIONS = options;

/** GET /api/v1/books/editions?workKey=/works/OL123W — editions of a work. */
export const GET = handler(async (request: Request) => {
  const { user } = await requireUser(request);
  await rateLimit(RATE_LIMITS.lookup, user.id);
  const workKey = new URL(request.url).searchParams.get("workKey") || "";
  if (!WORK_KEY_PATTERN.test(workKey)) {
    throw new ApiError("bad_request", "\"workKey\" must look like /works/OL123W.");
  }
  return json({ editions: await listEditions(workKey) });
});
