import type { Book, OwnershipStatus, ReadingStatus } from "../types";

export interface LibraryFilters {
  query: string;
  ownership: OwnershipStatus | "all";
  reading: ReadingStatus | "all";
}

export function filterBooks(books: Book[], { query, ownership, reading }: LibraryFilters): Book[] {
  const q = query.toLowerCase();
  return books.filter((b) => {
    const matchesQuery =
      !q || b.title.toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q);
    const matchesOwnership =
      ownership === "all" || (b.format === "Physical" && b.ownershipStatus === ownership);
    const matchesReading = reading === "all" || b.readingStatus === reading;
    return matchesQuery && matchesOwnership && matchesReading;
  });
}
