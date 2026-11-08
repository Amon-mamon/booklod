export type BookSearchState = "idle" | "searching" | "results" | "empty" | "error";

export interface BookEdition {
  key?: string;
  format: string;
  publisher: string;
  publishDate: string;
  isbn10: string;
  isbn13: string;
  pageCount: number | string;
}
