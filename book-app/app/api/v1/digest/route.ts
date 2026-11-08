import { requireUser } from "../../../../lib/api/auth";
import { handler, json, options } from "../../../../lib/api/http";
import { buildDigest } from "../../../../lib/api/services/digest";
import { loadLibrary } from "../../../../lib/api/services/library";
import { parseYear } from "../../../../lib/api/validation";

export const OPTIONS = options;

/** GET /api/v1/digest?year=2026 — reading stats for a year (default: current). */
export const GET = handler(async (request: Request) => {
  const year = parseYear(new URL(request.url).searchParams.get("year"));
  const { user, supabase } = await requireUser(request);
  const { books } = await loadLibrary(supabase, user.id);
  return json(buildDigest(books, year));
});
