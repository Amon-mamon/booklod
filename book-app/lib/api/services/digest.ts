import type { BookRecord } from "../../../features/shared/types";

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface ReadingDigest {
  year: number;
  totals: { finished: number; reading: number; toRead: number; lentOut: number };
  months: Array<{ month: number; label: string; finished: number; reading: number }>;
  finished: Array<{ id: string; title: string; author: string; endDate: string; coverUrl: string }>;
}

// Dates are stored as YYYY-MM-DD; read the parts directly so the result
// does not shift with the server's timezone.
function datePart(value: string | undefined): { year: number; month: number } | null {
  if (!value || !/^\d{4}-\d{2}/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7)) - 1;
  if (!Number.isInteger(year) || month < 0 || month > 11) return null;
  return { year, month };
}

/** Same rules as the web Reading Digest screen. */
export function buildDigest(books: BookRecord[], year: number): ReadingDigest {
  const months = MONTH_LABELS.map((label, month) => ({ month: month + 1, label, finished: 0, reading: 0 }));

  const finishedThisYear = books
    .filter((b) => b.readingStatus === "done" && datePart(b.endDate)?.year === year)
    .sort((a, b) => (b.endDate ?? "").localeCompare(a.endDate ?? ""));

  for (const book of finishedThisYear) {
    const part = datePart(book.endDate);
    if (part) months[part.month].finished += 1;
  }
  for (const book of books) {
    const part = datePart(book.startDate);
    if (book.readingStatus === "reading" && part?.year === year) months[part.month].reading += 1;
  }

  return {
    year,
    totals: {
      finished: finishedThisYear.length,
      reading: books.filter((b) => b.readingStatus === "reading").length,
      toRead: books.filter((b) => b.readingStatus === "toread").length,
      lentOut: books.filter((b) => b.format === "Physical" && b.ownershipStatus === "lent").length,
    },
    months,
    finished: finishedThisYear.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author || "",
      endDate: b.endDate || "",
      coverUrl: b.coverUrl || "",
    })),
  };
}
