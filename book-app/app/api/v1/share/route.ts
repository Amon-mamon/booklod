import { requireUserForWrite } from "../../../../lib/api/auth";
import { handler, json, options } from "../../../../lib/api/http";
import { publishShelf, stopSharing } from "../../../../lib/api/services/profile";

export const OPTIONS = options;

/** POST /api/v1/share — turn on sharing, or refresh the published snapshot. Plus only. */
export const POST = handler(async (request: Request) => {
  const { user, supabase } = await requireUserForWrite(request);
  const profile = await publishShelf(supabase, user);
  return json({ profile });
});

/** DELETE /api/v1/share — turn sharing off and unpublish the snapshot. */
export const DELETE = handler(async (request: Request) => {
  const { user, supabase } = await requireUserForWrite(request);
  const profile = await stopSharing(supabase, user);
  return json({ profile });
});
