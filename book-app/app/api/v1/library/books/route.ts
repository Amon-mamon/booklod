import { createServiceClient, requireUserForWrite } from "../../../../../lib/api/auth";
import { handler, json, options, readJson } from "../../../../../lib/api/http";
import { addBookOp, mutateLibrary } from "../../../../../lib/api/services/library";
import { generateBookId, parseBook } from "../../../../../lib/api/validation";

export const OPTIONS = options;

/** POST /api/v1/library/books — add a book. Body: { book: {...} } */
export const POST = handler(async (request: Request) => {
  const { user } = await requireUserForWrite(request);
  const body = (await readJson(request)) as { book?: unknown } | null;
  const book = parseBook(body?.book, generateBookId());
  const { revision } = await mutateLibrary(createServiceClient(), user.id, addBookOp(book));
  return json({ book, revision }, 201);
});
