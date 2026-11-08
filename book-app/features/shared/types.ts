export type BookFormat = "Physical" | "E-book" | "Kindle";
export type ReadingStatus = "toread" | "reading" | "done";
export type OwnershipStatus = "have" | "lent" | "given" | "none" | "";

export interface BookRecord {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  format?: BookFormat;
  ownershipStatus?: OwnershipStatus;
  ownershipDetail?: string;
  readingStatus?: ReadingStatus;
  startDate?: string;
  endDate?: string;
  lastPageRead?: number | string;
  review?: string;
  notes?: string;
  publisher?: string;
  edition?: string;
  editionFormat?: string;
  pubDate?: string;
  isbn?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number | string;
  language?: string;
  description?: string;
  coverUrl?: string;
  externalSource?: string;
  externalId?: string;
  [field: string]: string | number | undefined;
}

export interface BooklodProfile {
  name: string;
  email: string;
  provider: string;
  avatarInitial: string;
  photoUrl: string;
  notifications: {
    readingReminders: boolean;
    bookUpdates: boolean;
    productUpdates: boolean;
  };
  /** Plan id from public.plans (e.g. "starter", "plus", "plus_yearly"). Server-owned. */
  plan: string;
  /** Display name of the plan. Filled in by the server. */
  planName?: string;
  /** Whether the plan includes Share Your Shelf. Filled in by the server. */
  canShare?: boolean;
  shareEnabled: boolean;
  shareCode: string;
}

export interface ToastMessage {
  message: string;
  type: "success" | "error";
  id: number;
}

export type AuthMethod = "Google" | "Apple" | "Email";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}
