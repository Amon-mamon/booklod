"use client";

import { useCallback, useState } from "react";
import { compressImageFromUrl } from "@/lib/images/compress";
import { useImageUpload } from "@/lib/images/use-image-upload";
import { todayISO } from "@/lib/date";
import { useToast } from "@/providers/toast-provider";
import { getInitialValues, valuesToBook, type BookFormValues } from "../lib/book-form-mappers";
import { coverUrl as openLibraryCover, splitIsbns, type EditionOption, type OpenLibraryDoc } from "../services/open-library";
import type { Book, ReadingStatus } from "../types";
import { useBookSearch } from "./use-book-search";
import { useEditionOptions } from "./use-edition-options";

interface UseBookFormOptions {
  initial?: Book | null;
  existingBooks: Book[];
  onSave: (book: Book) => void;
}

export function useBookForm({ initial, existingBooks, onSave }: UseBookFormOptions) {
  const { showToast } = useToast();
  const isEdit = !!initial;

  const [values, setValues] = useState<BookFormValues>(() => getInitialValues(initial));
  const [titleError, setTitleError] = useState(false);
  const [cachingCover, setCachingCover] = useState(false);
  const [duplicate, setDuplicate] = useState<Book | null>(null);

  const search = useBookSearch(values.title, !isEdit);
  const editions = useEditionOptions();

  const setField = useCallback(
    <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    []
  );

  const coverUpload = useImageUpload((dataUrl) => {
    setField("coverUrl", dataUrl);
    showToast("Cover photo added");
  });
  /** True while a cover is being compressed (uploaded or cached from Open Library). */
  const busy = coverUpload.uploading || cachingCover;

  // ---- title -------------------------------------------------------------
  function handleTitleChange(next: string) {
    setField("title", next);
    setTitleError(false);
    setDuplicate(null);
  }

  // ---- Open Library suggestion / edition ----------------------------------
  function findDuplicate(source: string, id: string): Book | null {
    if (!id) return null;
    return (
      existingBooks.find((b) => b.externalSource === source && b.externalId === id && b.id !== initial?.id) || null
    );
  }

  function applySuggestion(doc: OpenLibraryDoc) {
    const { isbn10, isbn13 } = splitIsbns(doc.isbn);
    const workKey = doc.key || "";

    search.dismissFor(doc.title || values.title);
    editions.clear();
    setDuplicate(findDuplicate("openlibrary", workKey));

    setValues((prev) => ({
      ...prev,
      title: doc.title || prev.title,
      subtitle: doc.subtitle || "",
      author: doc.author_name?.join(", ") || prev.author,
      publisher: doc.publisher?.[0] || "",
      pubDate: doc.first_publish_year ? String(doc.first_publish_year) : "",
      isbn10,
      isbn13,
      pageCount: doc.number_of_pages_median ? String(doc.number_of_pages_median) : "",
      language: doc.language?.[0] || "",
      editionFormat: "",
      edition: "",
      externalSource: workKey ? "openlibrary" : "",
      externalId: workKey,
      // Show the medium cover right away; swap in the cached/compressed copy below.
      coverUrl: doc.cover_i ? openLibraryCover(doc.cover_i, "M") : "",
    }));

    if (doc.cover_i) {
      setCachingCover(true);
      compressImageFromUrl(openLibraryCover(doc.cover_i, "L"))
        .then((cached) => setField("coverUrl", cached))
        .catch(() => {})
        .finally(() => setCachingCover(false));
    }

    if (workKey) void editions.load(workKey);
  }

  function applyEdition(ed: EditionOption) {
    setValues((prev) => ({
      ...prev,
      publisher: ed.publisher || prev.publisher,
      pubDate: ed.publishDate || prev.pubDate,
      isbn10: ed.isbn10 || prev.isbn10,
      isbn13: ed.isbn13 || prev.isbn13,
      pageCount: ed.pageCount ? String(ed.pageCount) : prev.pageCount,
      editionFormat: ed.format || prev.editionFormat,
    }));
  }

  // ---- reading status auto-dates -----------------------------------------
  function handleReadingStatusChange(next: ReadingStatus) {
    setValues((prev) => {
      const was = prev.readingStatus;
      let { startDate, endDate } = prev;
      if (next === "reading" && was !== "reading" && !startDate) {
        startDate = todayISO();
      }
      if (next === "done" && was !== "done" && !endDate) {
        endDate = todayISO();
        if (was !== "reading" && !startDate) startDate = todayISO();
      }
      return { ...prev, readingStatus: next, startDate, endDate };
    });
  }

  // ---- submit ------------------------------------------------------------
  function submit() {
    if (!values.title.trim()) {
      setTitleError(true);
      return;
    }
    onSave(valuesToBook(values, initial));
  }

  // ---- soft warnings -----------------------------------------------------
  const dateWarning = !!(values.startDate && values.endDate && values.endDate < values.startDate);
  const pageWarning = !!(
    values.pageCount &&
    values.lastPageRead &&
    Number(values.lastPageRead) > Number(values.pageCount)
  );

  return {
    isEdit,
    values,
    setField,
    titleError,
    handleTitleChange,
    search,
    applySuggestion,
    duplicate,
    editions,
    applyEdition,
    coverUpload,
    busy,
    handleReadingStatusChange,
    dateWarning,
    pageWarning,
    submit,
  };
}

export type BookFormState = ReturnType<typeof useBookForm>;
