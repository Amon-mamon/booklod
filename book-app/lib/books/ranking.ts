// Pure Open Library helpers shared by the web client and the API routes.
// Keep this file free of browser/React imports so it can run on the server.

// Search result ranking — favors strong title matches, then uses
// Open-Library-provided signals (edition_count as a popularity proxy,
// metadata completeness) as tie-breakers. No invented popularity data.
export interface OpenLibrarySearchDoc {
  key?: string;
  title?: string;
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

export function normTitle(s: string) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function scoreBookDoc(doc: OpenLibrarySearchDoc, query: string) {
  const qn = normTitle(query);
  const tn = normTitle(doc.title || "");
  let score = 0;
  if (tn === qn) score += 100;
  else if (tn.startsWith(qn)) score += 60;
  else if (tn.includes(qn)) score += 35;
  else {
    const qWords = qn.split(" ").filter(Boolean);
    const tWords = new Set(tn.split(" ").filter(Boolean));
    const overlap = qWords.filter((w) => tWords.has(w)).length;
    score += overlap * 8;
  }
  if (doc.edition_count) score += Math.min(20, Math.log2(doc.edition_count + 1) * 4);
  if (doc.cover_i) score += 6;
  if (doc.author_name && doc.author_name.length) score += 4;
  if (doc.first_publish_year) score += 3;
  if (doc.publisher && doc.publisher.length) score += 2;
  if (doc.isbn && doc.isbn.length) score += 2;
  return score;
}

export function splitIsbns(isbnList?: string[]) {
  const isbn10 = (isbnList || []).find((v) => v.replace(/[^0-9Xx]/g, "").length === 10) || "";
  const isbn13 = (isbnList || []).find((v) => v.replace(/[^0-9Xx]/g, "").length === 13) || "";
  return { isbn10, isbn13 };
}
