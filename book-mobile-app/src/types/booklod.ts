// Data shapes shared with the web app and API (book-app/features/shared/types.ts).
// Keep these in sync with the API contract.

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
  createdAt?: number;
}

/** What the client sends when creating/updating a book (id comes from the URL). */
export type BookInput = Omit<BookRecord, "id" | "createdAt">;

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
  /** Plan id from the server (e.g. "starter", "plus", "plus_yearly"). */
  plan: string;
  /** Display name of the plan. */
  planName?: string;
  /** Whether the plan includes Share Your Shelf. */
  canShare?: boolean;
  shareEnabled: boolean;
  shareCode: string;
}

export type ProfilePatch = Partial<Pick<BooklodProfile, "name" | "photoUrl" | "plan">> & {
  notifications?: Partial<BooklodProfile["notifications"]>;
};

export interface LibrarySnapshot {
  books: BookRecord[];
  revision: number;
}

export interface ReadingDigest {
  year: number;
  totals: { finished: number; reading: number; toRead: number; lentOut: number };
  months: { month: number; label: string; finished: number; reading: number }[];
  finished: { id: string; title: string; author: string; endDate: string; coverUrl: string }[];
}

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

export interface BookEdition {
  key: string;
  format: string;
  publisher: string;
  publishDate: string;
  isbn10: string;
  isbn13: string;
  pageCount: number | string;
}

export interface SharedShelf {
  ownerName: string;
  updatedAt?: number;
  books: {
    title: string;
    author?: string;
    format?: BookFormat;
    readingStatus?: ReadingStatus;
    ownershipStatus?: OwnershipStatus;
  }[];
}

// ---------------------------------------------------------------------------
// Plans, settings and admin (book-app/app/api/v1/plans, /settings, /admin/*)
// ---------------------------------------------------------------------------
export type BillingInterval = "one_time" | "month" | "year";

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: BillingInterval;
  bookLimit: number | null;
  canShare: boolean;
  selfService: boolean;
  isActive: boolean;
  sortOrder: number;
  features: string[];
  kind: "plan" | "addon";
}

export interface AdminPlan extends Plan {
  subscriberCount: number;
}

export interface AppSettings {
  announcement_enabled: boolean;
  announcement_text: string;
  support_email: string;
  pricing_footnote: string;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
  source: string;
  isAdmin: boolean;
  bookCount: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  name: string;
  isAdmin: boolean;
  bookCount: number;
  shareEnabled: boolean;
  effectivePlan: { id: string; name: string } | null;
  subscription: {
    planId: string;
    status: string;
    currentPeriodEnd: string | null;
    source: string;
    note: string;
    updatedAt: string;
  } | null;
}
