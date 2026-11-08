import { createServiceClient, requireUser, requireUserForWrite } from "../../../../lib/api/auth";
import { ApiError, handler, json, options, readJson } from "../../../../lib/api/http";
import { loadLibrary, saveLibrary } from "../../../../lib/api/services/library";
import { parseLibraryReplace } from "../../../../lib/api/validation";

export const OPTIONS = options;

// A full library can include many cover images; the database caps it at 25 MB.
const LIBRARY_BODY_BYTES = 26 * 1024 * 1024;

/** GET /api/v1/library — every book plus the current revision. */
export const GET = handler(async (request: Request) => {
  const { user, supabase } = await requireUser(request);
  return json(await loadLibrary(supabase, user.id));
});

/** PUT /api/v1/library — replace the whole library (optimistic concurrency). */
export const PUT = handler(async (request: Request) => {
  const { user } = await requireUserForWrite(request);
  const { books, expectedRevision } = parseLibraryReplace(await readJson(request, LIBRARY_BODY_BYTES));
  const revision = await saveLibrary(createServiceClient(), user.id, books, expectedRevision);
  if (revision === null) {
    throw new ApiError("conflict", "The library changed since you loaded it. Reload and try again.");
  }
  return json({ books, revision });
});
