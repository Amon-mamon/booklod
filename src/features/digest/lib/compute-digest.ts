import type { Book } from "@/features/books/types";

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export interface DigestData {
  year: number;
  finishedThisYear: Book[];
  reading: Book[];
  toRead: Book[];
  lentOut: Book[];
  /** Books finished per month (index 0 = Jan) for `year`. */
  finishedByMonth: number[];
  /** Books currently being read, bucketed by the month they were started in `year`. */
  readingByMonth: number[];
}

/**
 * Reads year/month straight from a `YYYY-MM-DD` string. `new Date("2026-01-01")`
 * is parsed as UTC, which shifts the date back a day for users west of UTC.
 */
function yearMonth(iso: string | undefined): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})/.exec(iso || "");
  return match ? { year: Number(match[1]), month: Number(match[2]) - 1 } : null;
}

export function buildDigest(books: Book[], year: number): DigestData {
  const finishedByMonth: number[] = Array(12).fill(0);
  const readingByMonth: number[] = Array(12).fill(0);

  const finishedThisYear = books
    .filter((b) => b.readingStatus === "done" && yearMonth(b.endDate)?.year === year)
    .sort((a, b) => (b.endDate || "").localeCompare(a.endDate || ""));

  for (const b of finishedThisYear) {
    const ym = yearMonth(b.endDate);
    if (ym) finishedByMonth[ym.month]++;
  }

  for (const b of books) {
    if (b.readingStatus !== "reading") continue;
    const ym = yearMonth(b.startDate);
    if (ym && ym.year === year) readingByMonth[ym.month]++;
  }

  return {
    year,
    finishedThisYear,
    reading: books.filter((b) => b.readingStatus === "reading"),
    toRead: books.filter((b) => b.readingStatus === "toread"),
    lentOut: books.filter((b) => b.format === "Physical" && b.ownershipStatus === "lent"),
    finishedByMonth,
    readingByMonth,
  };
}
