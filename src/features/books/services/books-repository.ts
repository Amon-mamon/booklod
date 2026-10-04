import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, removeKey, writeJson } from "@/lib/storage/json";
import type { Book } from "../types";

export const booksRepository = {
  async load(): Promise<Book[]> {
    const stored = await readJson<unknown>(STORAGE_KEYS.books);
    return Array.isArray(stored) ? (stored as Book[]) : [];
  },
  save: (books: Book[]) => writeJson(STORAGE_KEYS.books, books),
  clear: () => removeKey(STORAGE_KEYS.books),
};
