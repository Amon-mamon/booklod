import { requireUser } from "../../../../../lib/api/auth";
import { ApiError, handler, json, options } from "../../../../../lib/api/http";
import { RATE_LIMITS, rateLimit } from "../../../../../lib/api/rate-limit";
import { searchBooks } from "../../../../../lib/api/services/openlibrary";

export const OPTIONS = options;

/** GET /api/v1/books/search?title=... — ranked Open Library lookup. */
export const GET = handler(async (request: Request) => {
  const { user } = await requireUser(request);
  await rateLimit(RATE_LIMITS.lookup, user.id);
  const title = (new URL(request.url).searchParams.get("title") || "").trim();
  if (title.length < 2 || title.length > 200) {
    throw new ApiError("bad_request", "\"title\" must be between 2 and 200 characters.");
  }
  return json({ results: await searchBooks(title) });
});
