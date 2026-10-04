/** Thin client for the Open Library search + editions endpoints. */

const BASE_URL = "https://openlibrary.org";
const COVERS_URL = "https://covers.openlibrary.org/b/id";
const SEARCH_FIELDS =
  "key,title,subtitle,author_name,first_publish_year,publisher,isbn,cover_i,language,edition_count,number_of_pages_median";
const MAX_SUGGESTIONS = 6;

export interface OpenLibraryDoc {
  key?: string;
  title: string;
  subtitle?: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  cover_i?: number;
  language?: string[];
  edition_count?: number;
  number_of_pages_median?: number;
}

export interface EditionOption {
  key?: string;
  format: string;
  publisher: string;
  publishDate: string;
  isbn10: string;
  isbn13: string;
  pageCount: number | string;
}

interface OpenLibraryEdition {
  key?: string;
  title?: string;
  publish_date?: string;
  physical_format?: string;
  publishers?: string[];
  isbn_10?: string[];
  isbn_13?: string[];
  number_of_pages?: number;
}

export function coverUrl(coverId: number, size: "S" | "M" | "L"): string {
  return `${COVERS_URL}/${coverId}-${size}.jpg`;
}

// ---------------------------------------------------------------------------
// Ranking — favours strong title matches, then uses Open-Library-provided
// signals (edition_count as a popularity proxy, metadata completeness) as
// tie-breakers. No invented popularity data.
// ---------------------------------------------------------------------------
function normTitle(s: string | undefined): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function scoreBookDoc(doc: OpenLibraryDoc, query: string): number {
  const qn = normTitle(query);
  const tn = normTitle(doc.title);
  let score = 0;
  if (tn === qn) score += 100;
  else if (tn.startsWith(qn)) score += 60;
  else if (tn.includes(qn)) score += 35;
  else {
    const qWords = qn.split(" ").filter(Boolean);
    const tWords = new Set(tn.split(" ").filter(Boolean));
    score += qWords.filter((w) => tWords.has(w)).length * 8;
  }
  if (doc.edition_count) score += Math.min(20, Math.log2(doc.edition_count + 1) * 4);
  if (doc.cover_i) score += 6;
  if (doc.author_name?.length) score += 4;
  if (doc.first_publish_year) score += 3;
  if (doc.publisher?.length) score += 2;
  if (doc.isbn?.length) score += 2;
  return score;
}

export function splitIsbns(isbnList: string[] | undefined): { isbn10: string; isbn13: string } {
  const digits = (v: string) => v.replace(/[^0-9Xx]/g, "").length;
  return {
    isbn10: (isbnList || []).find((v) => digits(v) === 10) || "",
    isbn13: (isbnList || []).find((v) => digits(v) === 13) || "",
  };
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------
export async function searchBooks(title: string, signal?: AbortSignal): Promise<OpenLibraryDoc[]> {
  const res = await fetch(
    `${BASE_URL}/search.json?title=${encodeURIComponent(title)}&fields=${SEARCH_FIELDS}&limit=15`,
    { signal }
  );
  if (!res.ok) throw new Error("search-failed");
  const data: { docs?: OpenLibraryDoc[] } = await res.json();
  return (data.docs || [])
    .filter((d) => d.title)
    .map((doc) => ({ doc, score: scoreBookDoc(doc, title) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((x) => x.doc);
}

/** Distinct editions of a work (deduped by date + binding + publisher). */
export async function fetchEditions(workKey: string, signal?: AbortSignal): Promise<EditionOption[]> {
  const res = await fetch(`${BASE_URL}${workKey}/editions.json?limit=20`, { signal });
  if (!res.ok) return [];
  const data: { entries?: OpenLibraryEdition[] } = await res.json();
  if (!data.entries) return [];

  const seen = new Set<string>();
  return data.entries
    .filter((e) => e.title)
    .filter((e) => {
      const key = `${e.publish_date || ""}|${e.physical_format || ""}|${(e.publishers || [])[0] || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map((e) => ({
      key: e.key,
      format: e.physical_format || "",
      publisher: e.publishers?.[0] || "",
      publishDate: e.publish_date || "",
      isbn10: e.isbn_10?.[0] || "",
      isbn13: e.isbn_13?.[0] || "",
      pageCount: e.number_of_pages || "",
    }));
}
