import { getSupabaseClient } from "../../../lib/supabase/client";
import { apiFetch } from "../../shared/api-client";
import type { BookRecord } from "../../shared/types";

export interface LibrarySnapshot {
  books: BookRecord[];
  revision: number;
}

export async function loadBooks(userId: string): Promise<LibrarySnapshot> {
  const { data, error } = await getSupabaseClient()
    .from("libraries")
    .select("books, revision")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return {
    books: (data?.books as BookRecord[] | undefined) || [],
    revision: data?.revision ?? 0,
  };
}

// Writes go through the API: it validates the book and retries on revision
// conflicts, so other sessions' edits to other books are kept.
export async function createBook(book: BookRecord): Promise<BookRecord> {
  const res = await apiFetch<{ book: BookRecord }>("/api/v1/library/books", {
    method: "POST",
    body: JSON.stringify({ book }),
  });
  return res.book;
}

export async function updateBook(book: BookRecord): Promise<BookRecord> {
  const res = await apiFetch<{ book: BookRecord }>(`/api/v1/library/books/${encodeURIComponent(book.id)}`, {
    method: "PUT",
    body: JSON.stringify({ book }),
  });
  return res.book;
}

export async function removeBook(id: string): Promise<void> {
  await apiFetch(`/api/v1/library/books/${encodeURIComponent(id)}`, { method: "DELETE" });
}
