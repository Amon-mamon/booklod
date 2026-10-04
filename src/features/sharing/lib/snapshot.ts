import type { Book } from "@/features/books/types";
import type { SharedShelfBook, SharedShelfPayload } from "../types";

export const MAX_SHARED_BOOKS = 200;
const MAX_TEXT = 300;
const MAX_OWNER_NAME = 80;
const FORMATS = ["Physical", "E-book", "Kindle"];
const READING = ["toread", "reading", "done"];
const OWNERSHIP = ["have", "lent", "given", "none", ""];

/** Client side: reduce the library to the public subset. */
export function buildSharePayload(ownerName: string, books: Book[]): SharedShelfPayload {
  return {
    ownerName: ownerName || "A Booklod reader",
    books: books.slice(0, MAX_SHARED_BOOKS).map((b) => ({
      title: b.title,
      author: b.author || "",
      format: b.format,
      readingStatus: b.readingStatus,
      ownershipStatus: b.ownershipStatus || "",
    })),
  };
}

const isText = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

/** Server side: never trust the client — validate shape and sizes. */
export function parseSharePayload(input: unknown): SharedShelfPayload | null {
  if (!input || typeof input !== "object") return null;
  const { ownerName, books } = input as Record<string, unknown>;
  if (!isText(ownerName, MAX_OWNER_NAME) || !Array.isArray(books) || books.length > MAX_SHARED_BOOKS) return null;

  const parsed: SharedShelfBook[] = [];
  for (const raw of books) {
    if (!raw || typeof raw !== "object") return null;
    const b = raw as Record<string, unknown>;
    if (
      !isText(b.title, MAX_TEXT) ||
      !isText(b.author, MAX_TEXT) ||
      typeof b.format !== "string" || !FORMATS.includes(b.format) ||
      typeof b.readingStatus !== "string" || !READING.includes(b.readingStatus) ||
      typeof b.ownershipStatus !== "string" || !OWNERSHIP.includes(b.ownershipStatus)
    ) {
      return null;
    }
    parsed.push(b as unknown as SharedShelfBook);
  }
  return { ownerName, books: parsed };
}
