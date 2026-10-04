import { createId } from "@/lib/id";
import type { Book, BookFormat, OwnershipStatus, ReadingStatus } from "../types";

/** Everything the form edits, as strings (what inputs actually hold). */
export interface BookFormValues {
  title: string;
  subtitle: string;
  author: string;
  format: BookFormat;
  ownershipStatus: OwnershipStatus;
  ownershipDetail: string;
  readingStatus: ReadingStatus;
  startDate: string;
  endDate: string;
  lastPageRead: string;
  review: string;
  notes: string;
  publisher: string;
  edition: string;
  editionFormat: string;
  pubDate: string;
  isbn10: string;
  isbn13: string;
  pageCount: string;
  language: string;
  description: string;
  coverUrl: string;
  externalSource: string;
  externalId: string;
}

export function getInitialValues(initial?: Book | null): BookFormValues {
  return {
    title: initial?.title || "",
    subtitle: initial?.subtitle || "",
    author: initial?.author || "",
    format: initial?.format || "Physical",
    ownershipStatus: initial?.ownershipStatus || "have",
    ownershipDetail: initial?.ownershipDetail || "",
    readingStatus: initial?.readingStatus || "toread",
    startDate: initial?.startDate || "",
    endDate: initial?.endDate || "",
    lastPageRead: initial?.lastPageRead === "" || initial?.lastPageRead == null ? "" : String(initial.lastPageRead),
    review: initial?.review || "",
    notes: initial?.notes || "",
    publisher: initial?.publisher || "",
    edition: initial?.edition || "",
    editionFormat: initial?.editionFormat || "",
    pubDate: initial?.pubDate || "",
    // Older records stored a single `isbn`; split it by length.
    isbn10: initial?.isbn10 || (initial?.isbn?.length === 10 ? initial.isbn : "") || "",
    isbn13: initial?.isbn13 || (initial?.isbn?.length === 13 ? initial.isbn : "") || "",
    pageCount: initial?.pageCount ? String(initial.pageCount) : "",
    language: initial?.language || "",
    description: initial?.description || "",
    coverUrl: initial?.coverUrl || "",
    externalSource: initial?.externalSource || "",
    externalId: initial?.externalId || "",
  };
}

export function valuesToBook(values: BookFormValues, initial?: Book | null): Book {
  const isPhysical = values.format === "Physical";
  return {
    id: initial?.id || createId("b"),
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    author: values.author.trim(),
    format: values.format,
    ownershipStatus: isPhysical ? values.ownershipStatus : "",
    ownershipDetail: isPhysical ? values.ownershipDetail.trim() : "",
    readingStatus: values.readingStatus,
    startDate: values.startDate,
    endDate: values.endDate,
    lastPageRead: values.lastPageRead === "" ? "" : Number(values.lastPageRead),
    review: values.review,
    notes: values.notes,
    publisher: values.publisher.trim(),
    edition: values.edition.trim(),
    editionFormat: values.editionFormat.trim(),
    pubDate: values.pubDate.trim(),
    isbn10: values.isbn10.trim(),
    isbn13: values.isbn13.trim(),
    pageCount: values.pageCount,
    language: values.language.trim(),
    description: values.description.trim(),
    coverUrl: values.coverUrl,
    externalSource: values.externalSource || "",
    externalId: values.externalId || "",
    createdAt: initial?.createdAt || Date.now(),
  };
}
