export type BookFormat = "Physical" | "E-book" | "Kindle";
export type OwnershipStatus = "have" | "lent" | "given" | "none";
export type ReadingStatus = "toread" | "reading" | "done";

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  format: BookFormat;
  /** Only meaningful for physical books; empty string otherwise. */
  ownershipStatus: OwnershipStatus | "";
  ownershipDetail: string;
  readingStatus: ReadingStatus;
  startDate: string;
  endDate: string;
  lastPageRead: number | "";
  review: string;
  notes: string;
  publisher?: string;
  edition?: string;
  editionFormat?: string;
  pubDate?: string;
  isbn10?: string;
  isbn13?: string;
  /** Legacy single-ISBN field from earlier versions of the app. */
  isbn?: string;
  pageCount?: string | number;
  language?: string;
  description?: string;
  /** Remote URL or compressed data URL. */
  coverUrl?: string;
  externalSource?: string;
  externalId?: string;
  createdAt?: number;
}
