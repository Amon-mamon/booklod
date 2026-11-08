import { scoreBookDoc, splitIsbns, type OpenLibrarySearchDoc } from "../../books/ranking";
import { ApiError } from "../http";

export interface BookSearchResult {
  workKey: string;
  title: string;
  subtitle: string;
  authors: string[];
  firstPublishYear: number | null;
  publisher: string;
  isbn10: string;
  isbn13: string;
  pageCount: number | null;
  language: string;
  coverUrl: string;
  coverThumbUrl: string;
}

export interface BookEditionResult {
  key: string;
  format: string;
  publisher: string;
  publishDate: string;
  isbn10: string;
  isbn13: string;
  pageCount: number | string;
}

const OPEN_LIBRARY = "https://openlibrary.org";
const SEARCH_FIELDS =
  "key,title,subtitle,author_name,first_publish_year,publisher,isbn,cover_i,language,edition_count,number_of_pages_median";

async function fetchJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 3600 } });
  } catch {
    throw new ApiError("upstream_error", "We couldn't search for books right now.");
  }
  if (!response.ok) throw new ApiError("upstream_error", "We couldn't search for books right now.");
  return response.json();
}

export function toSearchResult(doc: OpenLibrarySearchDoc): BookSearchResult {
  const { isbn10, isbn13 } = splitIsbns(doc.isbn);
  return {
    workKey: doc.key || "",
    title: doc.title || "",
    subtitle: doc.subtitle || "",
    authors: doc.author_name || [],
    firstPublishYear: doc.first_publish_year ?? null,
    publisher: doc.publisher?.[0] || "",
    isbn10,
    isbn13,
    pageCount: doc.number_of_pages_median ?? null,
    language: doc.language?.[0] || "",
    coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : "",
    coverThumbUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : "",
  };
}

export async function searchBooks(title: string, limit = 6): Promise<BookSearchResult[]> {
  const url = `${OPEN_LIBRARY}/search.json?title=${encodeURIComponent(title)}&fields=${SEARCH_FIELDS}&limit=15`;
  const data = (await fetchJson(url)) as { docs?: OpenLibrarySearchDoc[] };
  return (data.docs || [])
    .filter((doc) => doc.title)
    .map((doc) => ({ doc, score: scoreBookDoc(doc, title) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc }) => toSearchResult(doc));
}

function firstString(value: unknown): string {
  return Array.isArray(value) && typeof value[0] === "string" ? value[0] : "";
}

export function toEditions(entries: Array<Record<string, unknown>>): BookEditionResult[] {
  const seen = new Set<string>();
  return entries
    .filter((entry) => typeof entry.title === "string")
    .filter((entry) => {
      const key = `${entry.publish_date || ""}|${entry.physical_format || ""}|${firstString(entry.publishers)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map((entry) => ({
      key: typeof entry.key === "string" ? entry.key : "",
      format: typeof entry.physical_format === "string" ? entry.physical_format : "",
      publisher: firstString(entry.publishers),
      publishDate: typeof entry.publish_date === "string" ? entry.publish_date : "",
      isbn10: firstString(entry.isbn_10),
      isbn13: firstString(entry.isbn_13),
      pageCount:
        typeof entry.number_of_pages === "number" || typeof entry.number_of_pages === "string"
          ? entry.number_of_pages
          : "",
    }));
}

export const WORK_KEY_PATTERN = /^\/works\/OL\d+W$/;

export async function listEditions(workKey: string): Promise<BookEditionResult[]> {
  const data = (await fetchJson(`${OPEN_LIBRARY}${workKey}/editions.json?limit=20`)) as {
    entries?: Array<Record<string, unknown>>;
  };
  return toEditions(data.entries || []);
}
