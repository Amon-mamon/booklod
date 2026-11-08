import { createServiceClient, requireUser, requireUserForWrite } from "../../../../../../lib/api/auth";
import { ApiError, handler, json, options, readJson } from "../../../../../../lib/api/http";
import {
  deleteBookOp,
  findBook,
  loadLibrary,
  mutateLibrary,
  replaceBookOp,
} from "../../../../../../lib/api/services/library";
import { isValidBookId, parseBook } from "../../../../../../lib/api/validation";

type Context = { params: Promise<{ id: string }> };

async function bookId(context: Context) {
  const { id } = await context.params;
  if (!isValidBookId(id)) throw new ApiError("bad_request", "Invalid book id.");
  return id;
}

export const OPTIONS = options;

/** GET /api/v1/library/books/:id */
export const GET = handler(async (request: Request, context: Context) => {
  const id = await bookId(context);
  const { user, supabase } = await requireUser(request);
  const { books, revision } = await loadLibrary(supabase, user.id);
  return json({ book: findBook(books, id), revision });
});

/** PUT /api/v1/library/books/:id — replace a book. Body: { book: {...} } */
export const PUT = handler(async (request: Request, context: Context) => {
  const id = await bookId(context);
  const { user } = await requireUserForWrite(request);
  const body = (await readJson(request)) as { book?: unknown } | null;
  const book = parseBook(body?.book, id);
  const { books, revision } = await mutateLibrary(createServiceClient(), user.id, replaceBookOp(book));
  return json({ book: findBook(books, id), revision });
});

/** DELETE /api/v1/library/books/:id */
export const DELETE = handler(async (request: Request, context: Context) => {
  const id = await bookId(context);
  const { user } = await requireUserForWrite(request);
  const { revision } = await mutateLibrary(createServiceClient(), user.id, deleteBookOp(id));
  return json({ revision });
});
