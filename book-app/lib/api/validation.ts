import type { BookRecord, BooklodProfile } from "../../features/shared/types";
import { ApiError } from "./http";

const FORMATS = ["Physical", "E-book", "Kindle"] as const;
const READING = ["toread", "reading", "done"] as const;
const OWNERSHIP = ["have", "lent", "given", "none", ""] as const;
export const PLAN_ID_PATTERN = /^[a-z0-9_-]{2,40}$/;

const SHORT_TEXT = 500;
const LONG_TEXT = 4000;
// Covers/photos are stored as compressed data URLs (~235KB target).
const MAX_IMAGE_CHARS = 400 * 1024;

const SHORT_TEXT_FIELDS = [
  "subtitle",
  "author",
  "ownershipDetail",
  "publisher",
  "edition",
  "editionFormat",
  "pubDate",
  "isbn",
  "isbn10",
  "isbn13",
  "language",
  "externalSource",
  "externalId",
] as const;
const LONG_TEXT_FIELDS = ["review", "notes", "description"] as const;
const DATE_FIELDS = ["startDate", "endDate"] as const;
const NUMBER_OR_EMPTY_FIELDS = ["lastPageRead", "pageCount"] as const;

export const MAX_BOOKS = 5000;
export const BOOK_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function bad(message: string): never {
  throw new ApiError("bad_request", message);
}

function optionalString(input: Record<string, unknown>, key: string, max: number): string | undefined {
  const value = input[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") bad(`"${key}" must be a string.`);
  if (value.length > max) bad(`"${key}" must be at most ${max} characters.`);
  return value;
}

function optionalEnum<T extends string>(
  input: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const value = input[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    bad(`"${key}" must be one of: ${allowed.filter(Boolean).join(", ")}.`);
  }
  return value as T;
}

function optionalNumberOrEmpty(input: Record<string, unknown>, key: string): number | string | undefined {
  const value = input[key];
  if (value === undefined || value === null || value === "") return value === "" ? "" : undefined;
  const num = typeof value === "string" ? Number(value) : value;
  if (typeof num !== "number" || !Number.isFinite(num) || num < 0 || num > 1_000_000) {
    bad(`"${key}" must be a non-negative number.`);
  }
  return Math.floor(num);
}

// Remote images are limited to hosts the app itself produces, so a stored
// URL can't be used as a tracking pixel on a shared shelf or profile.
const STATIC_IMAGE_HOSTS = ["covers.openlibrary.org"];
const IMAGE_HOST_SUFFIXES = [".googleusercontent.com"];

function allowedImageHost(host: string): boolean {
  const supabaseHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").host;
    } catch {
      return "";
    }
  })();
  return (
    STATIC_IMAGE_HOSTS.includes(host) ||
    IMAGE_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix)) ||
    (supabaseHost !== "" && host === supabaseHost)
  );
}

function optionalImage(input: Record<string, unknown>, key: string): string | undefined {
  const value = optionalString(input, key, MAX_IMAGE_CHARS);
  if (value === undefined || value === "") return value;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(value)) return value;
  let url: URL | null = null;
  try {
    url = new URL(value);
  } catch {
    url = null;
  }
  if (!url || url.protocol !== "https:" || url.username || url.password || !allowedImageHost(url.host)) {
    bad(`"${key}" must be a base64 image or an image from Open Library, Google or this app's storage.`);
  }
  return value;
}

export function isValidBookId(id: string) {
  return BOOK_ID_PATTERN.test(id);
}

export function generateBookId() {
  return "b_" + crypto.randomUUID().replace(/-/g, "");
}

/**
 * Validates a book payload and returns a clean BookRecord containing only
 * known fields. `id` is taken from the route (update) or generated (create).
 */
export function parseBook(input: unknown, id: string, createdAt?: number): BookRecord {
  if (!isRecord(input)) bad("Request body must contain a \"book\" object.");

  const title = optionalString(input, "title", SHORT_TEXT)?.trim();
  if (!title) bad("\"title\" is required.");

  const format = optionalEnum(input, "format", FORMATS) ?? "Physical";
  const book: BookRecord = {
    id,
    title,
    format,
    readingStatus: optionalEnum(input, "readingStatus", READING) ?? "toread",
    ownershipStatus:
      format === "Physical" ? (optionalEnum(input, "ownershipStatus", OWNERSHIP) ?? "have") : "",
  };

  for (const key of SHORT_TEXT_FIELDS) {
    const value = optionalString(input, key, SHORT_TEXT);
    if (value !== undefined) book[key] = value.trim();
  }
  for (const key of LONG_TEXT_FIELDS) {
    const value = optionalString(input, key, LONG_TEXT);
    if (value !== undefined) book[key] = value;
  }
  for (const key of DATE_FIELDS) {
    const value = optionalString(input, key, 10);
    if (value !== undefined && value !== "" && !ISO_DATE.test(value)) bad(`"${key}" must be YYYY-MM-DD.`);
    if (value !== undefined) book[key] = value;
  }
  for (const key of NUMBER_OR_EMPTY_FIELDS) {
    const value = optionalNumberOrEmpty(input, key);
    if (value !== undefined) book[key] = value;
  }
  const coverUrl = optionalImage(input, "coverUrl");
  if (coverUrl !== undefined) book.coverUrl = coverUrl;

  if (format !== "Physical") book.ownershipDetail = "";
  book.createdAt = createdAt ?? Date.now();
  return book;
}

export type ProfilePatch = Partial<Pick<BooklodProfile, "name" | "photoUrl" | "plan">> & {
  notifications?: Partial<BooklodProfile["notifications"]>;
};

/** Only user-editable profile fields are accepted. Share state uses /share. */
export function parseProfilePatch(input: unknown): ProfilePatch {
  if (!isRecord(input)) bad("Request body must be a JSON object.");
  const patch: ProfilePatch = {};

  const name = optionalString(input, "name", 100);
  if (name !== undefined) patch.name = name.trim();

  const photoUrl = optionalImage(input, "photoUrl");
  if (photoUrl !== undefined) patch.photoUrl = photoUrl;

  const plan = optionalString(input, "plan", 40);
  if (plan !== undefined) {
    if (!PLAN_ID_PATTERN.test(plan)) bad("\"plan\" is not a valid plan id.");
    patch.plan = plan;
  }

  if (input.notifications !== undefined) {
    if (!isRecord(input.notifications)) bad("\"notifications\" must be an object.");
    const notifications: ProfilePatch["notifications"] = {};
    for (const key of ["readingReminders", "bookUpdates", "productUpdates"] as const) {
      const value = input.notifications[key];
      if (value === undefined) continue;
      if (typeof value !== "boolean") bad(`"notifications.${key}" must be a boolean.`);
      notifications[key] = value;
    }
    patch.notifications = notifications;
  }

  if (Object.keys(patch).length === 0) {
    bad("Nothing to update. Allowed fields: name, photoUrl, plan, notifications.");
  }
  return patch;
}

export function parseLibraryReplace(input: unknown): { books: BookRecord[]; expectedRevision: number } {
  if (!isRecord(input)) bad("Request body must be a JSON object.");
  const { books, expectedRevision } = input;
  if (!Array.isArray(books)) bad("\"books\" must be an array.");
  if (books.length > MAX_BOOKS) bad(`A library can hold at most ${MAX_BOOKS} books.`);
  if (typeof expectedRevision !== "number" || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    bad("\"expectedRevision\" must be a non-negative integer.");
  }
  const seen = new Set<string>();
  const parsed = books.map((raw, index) => {
    const id = isRecord(raw) && typeof raw.id === "string" ? raw.id : "";
    if (!isValidBookId(id)) bad(`books[${index}].id is missing or invalid.`);
    if (seen.has(id)) bad(`books[${index}].id is duplicated.`);
    seen.add(id);
    const createdAt = isRecord(raw) && typeof raw.createdAt === "number" ? raw.createdAt : undefined;
    return parseBook(raw, id, createdAt);
  });
  return { books: parsed, expectedRevision };
}

export function parseYear(value: string | null): number {
  if (!value) return new Date().getFullYear();
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 3000) bad("\"year\" must be a 4-digit year.");
  return year;
}

export const SHARE_CODE_PATTERN = /^[A-Fa-f0-9]{32}$/;
