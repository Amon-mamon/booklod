import type { BookFormat, OwnershipStatus, ReadingStatus } from "@/features/books/types";

/**
 * Only title/author/format/status are ever published — no cover photos, no
 * notes — to keep each snapshot small and private details private.
 */
export interface SharedShelfBook {
  title: string;
  author: string;
  format: BookFormat;
  readingStatus: ReadingStatus;
  ownershipStatus: OwnershipStatus | "";
}

export interface SharedShelfSnapshot {
  ownerName: string;
  updatedAt: number;
  books: SharedShelfBook[];
}

/** What the client sends; `updatedAt` is stamped by the server. */
export type SharedShelfPayload = Omit<SharedShelfSnapshot, "updatedAt">;
