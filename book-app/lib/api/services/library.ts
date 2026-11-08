import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookRecord } from "../../../features/shared/types";
import { ApiError, fromDatabaseError } from "../http";
import { MAX_BOOKS } from "../validation";

export interface LibrarySnapshot {
  books: BookRecord[];
  revision: number;
}

export async function loadLibrary(supabase: SupabaseClient, userId: string): Promise<LibrarySnapshot> {
  const { data, error } = await supabase
    .from("libraries")
    .select("books, revision")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw fromDatabaseError(error, "Unable to load your library.");
  return {
    books: (data?.books as BookRecord[] | undefined) || [],
    revision: Number(data?.revision ?? 0),
  };
}

/** Saves with optimistic concurrency. Returns null when the revision is stale. */
export async function saveLibrary(
  supabase: SupabaseClient,
  userId: string,
  books: BookRecord[],
  expectedRevision: number,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("save_library_snapshot", {
    p_user_id: userId,
    p_expected_revision: expectedRevision,
    p_books: books,
  });

  if (error) throw fromDatabaseError(error, "Unable to save your library.");
  if (data === null) return null;
  if (typeof data !== "number" || !Number.isSafeInteger(data)) {
    throw new ApiError("internal_error", "The library save returned an invalid revision.");
  }
  return data;
}

const MAX_ATTEMPTS = 3;

/**
 * Applies a single-book operation to the latest library snapshot. Because the
 * operation is re-applied to freshly loaded data on a revision conflict, other
 * sessions' edits to *other* books are never lost.
 */
export async function mutateLibrary(
  supabase: SupabaseClient,
  userId: string,
  operation: (books: BookRecord[]) => BookRecord[],
): Promise<LibrarySnapshot> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const current = await loadLibrary(supabase, userId);
    const next = operation(current.books);
    const revision = await saveLibrary(supabase, userId, next, current.revision);
    if (revision !== null) return { books: next, revision };
  }
  throw new ApiError("conflict", "Your library is receiving frequent updates. Wait a moment and try again.");
}

export function findBook(books: BookRecord[], id: string): BookRecord {
  const book = books.find((b) => b.id === id);
  if (!book) throw new ApiError("not_found", "Book not found.");
  return book;
}

export function addBookOp(book: BookRecord) {
  return (books: BookRecord[]) => {
    if (books.some((b) => b.id === book.id)) {
      throw new ApiError("conflict", "A book with this id already exists.");
    }
    if (books.length >= MAX_BOOKS) {
      throw new ApiError("bad_request", `A library can hold at most ${MAX_BOOKS} books.`);
    }
    return [book, ...books];
  };
}

export function replaceBookOp(book: BookRecord) {
  return (books: BookRecord[]) => {
    const existing = findBook(books, book.id);
    const merged = { ...book, createdAt: existing.createdAt ?? book.createdAt };
    return books.map((b) => (b.id === book.id ? merged : b));
  };
}

export function deleteBookOp(id: string) {
  return (books: BookRecord[]) => {
    findBook(books, id);
    return books.filter((b) => b.id !== id);
  };
}
