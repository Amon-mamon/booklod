import { Archive, Book, BookMarked, Gift, MapPin, Tablet, Users, type LucideIcon } from "lucide-react-native";
import { C } from "@/theme";
import type { BookFormat, BookRecord, OwnershipStatus, ReadingStatus } from "@/types/booklod";

// Mirrors book-app/features/shared/shared.ts so both apps label books the same.

export type OwnedStatus = Exclude<OwnershipStatus, "">;

export const OWNERSHIP: Record<OwnedStatus, { label: string; icon: LucideIcon; color: string; tint: string; field: string }> = {
  have: { label: "Have It", icon: MapPin, color: C.green, tint: C.greenT, field: "Place of storage" },
  lent: { label: "Lent Out", icon: Users, color: C.navy, tint: C.navyT, field: "Who borrowed it" },
  given: { label: "Given Away", icon: Gift, color: C.navy, tint: C.navyT, field: "Given to" },
  none: { label: "No Longer Have It", icon: Archive, color: C.muted, tint: "#EDEAE3", field: "Notes" },
};

export const READING: Record<ReadingStatus, { label: string; color: string; tint: string }> = {
  toread: { label: "To Read", color: C.navy, tint: C.navyT },
  reading: { label: "Reading", color: C.orange, tint: C.orangeT },
  done: { label: "Done Reading", color: C.green, tint: C.greenT },
};

export const FORMATS: Record<BookFormat, { icon: LucideIcon; label: string }> = {
  Physical: { icon: Book, label: "Physical" },
  "E-book": { icon: Tablet, label: "E-book" },
  Kindle: { icon: BookMarked, label: "Kindle" },
};

export const READING_FILTERS = ["All", "To Read", "Reading", "Done Reading"] as const;
export const OWNERSHIP_FILTERS = ["All", "Have It", "Lent Out", "Given Away", "No Longer Have It"] as const;

/** Overall "vibe" color for a book — drives the cover badge tint. */
export function statusColor(book: Pick<BookRecord, "readingStatus" | "format" | "ownershipStatus">) {
  if (book.readingStatus === "reading") return { color: C.orange, tint: C.orangeT };
  if (book.format === "Physical" && (book.ownershipStatus === "lent" || book.ownershipStatus === "given"))
    return { color: C.navy, tint: C.navyT };
  if (book.readingStatus === "done") return { color: C.green, tint: C.greenT };
  return { color: C.navy, tint: C.navyT };
}

export function cardStatusText(book: BookRecord): string {
  if (book.format === "Physical" && book.ownershipStatus === "lent")
    return book.ownershipDetail ? `Lent to ${book.ownershipDetail}` : "Lent Out";
  if (book.format === "Physical" && book.ownershipStatus === "given")
    return book.ownershipDetail ? `Given to ${book.ownershipDetail}` : "Given Away";
  if (book.format === "Physical" && book.ownershipStatus === "none") return "No longer have it";
  if (book.readingStatus === "done") return book.format === "Physical" ? "Finished · have it" : "Finished";
  if (book.readingStatus === "reading") return book.lastPageRead ? `Reading · p.${book.lastPageRead}` : "Reading";
  return "To Read";
}

export function filterBooks(books: BookRecord[], query: string, readingFilter: string, ownershipFilter: string) {
  const q = query.trim().toLowerCase();
  return books.filter((b) => {
    const matchesQuery = !q || b.title.toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q);
    const matchesOwnership =
      ownershipFilter === "All" ||
      (b.format === "Physical" && !!b.ownershipStatus && OWNERSHIP[b.ownershipStatus]?.label === ownershipFilter);
    const matchesReading = readingFilter === "All" || READING[b.readingStatus || "toread"]?.label === readingFilter;
    return matchesQuery && matchesOwnership && matchesReading;
  });
}
