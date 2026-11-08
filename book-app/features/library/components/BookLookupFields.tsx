"use client";

import { Book, Loader2 } from "lucide-react";
import { C } from "../../../app/components/theme";
import { FieldLabel } from "../../../app/components/ui/FieldLabel";
import type { BookRecord } from "../../shared/types";
import type { OpenLibrarySearchDoc } from "../../shared/shared";
import type { BookEdition, BookSearchState } from "../types";

interface BookLookupFieldsProps {
  title: string;
  titleError: boolean;
  searchState: BookSearchState;
  showSuggestions: boolean;
  suggestions: OpenLibrarySearchDoc[];
  duplicateBook: BookRecord | null;
  loadingEditions: boolean;
  editionOptions: BookEdition[];
  onTitleChange: (value: string) => void;
  onTitleFocus: () => void;
  onDismissSuggestions: () => void;
  onApplySuggestion: (doc: OpenLibrarySearchDoc) => void;
  onViewDuplicate: (book: BookRecord) => void;
  onApplyEdition: (edition: BookEdition) => void;
}

export function BookLookupFields({
  title,
  titleError,
  searchState,
  showSuggestions,
  suggestions,
  duplicateBook,
  loadingEditions,
  editionOptions,
  onTitleChange,
  onTitleFocus,
  onDismissSuggestions,
  onApplySuggestion,
  onViewDuplicate,
  onApplyEdition,
}: BookLookupFieldsProps) {
  return (
    <>
      <div className="mb-4 relative">
        <FieldLabel>Book Title</FieldLabel>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#5B8467]"
              style={{ borderColor: titleError ? "#D64545" : C.tan, color: C.navy }}
              placeholder="Search for a book..."
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              onFocus={onTitleFocus}
            />
            {searchState === "searching" && (
              <Loader2
                size={16}
                className="animate-spin absolute right-3 top-2.5"
                style={{ color: C.green }}
              />
            )}

            {showSuggestions && searchState !== "idle" && (
              <div
                className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg overflow-hidden"
                style={{ border: `1px solid ${C.tan}` }}
              >
                {searchState === "searching" && (
                  <div className="px-3 py-3 flex items-center gap-2 text-sm" style={{ color: C.muted }}>
                    <Loader2 size={14} className="animate-spin" /> Searching books...
                  </div>
                )}

                {searchState === "results" && (
                  <div className="max-h-72 overflow-y-auto">
                    {suggestions.map((doc, index) => (
                      <button
                        key={doc.key || index}
                        type="button"
                        onClick={() => onApplySuggestion(doc)}
                        className="w-full text-left px-3 py-2.5 hover:bg-[#F4EFE6] flex items-center gap-2.5 border-b last:border-b-0"
                        style={{ borderColor: C.tan }}
                      >
                        {doc.cover_i ? (
                          <img
                            src={`https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`}
                            className="w-8 h-11 object-cover rounded flex-shrink-0"
                            alt=""
                          />
                        ) : (
                          <div
                            className="w-8 h-11 rounded flex-shrink-0 flex items-center justify-center"
                            style={{ background: C.cream }}
                          >
                            <Book size={13} style={{ color: C.muted }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: C.navy }}>
                            {doc.title}
                          </div>
                          <div className="text-xs truncate" style={{ color: C.muted }}>
                            {doc.author_name?.join(", ") || "Unknown author"}
                          </div>
                          {(doc.first_publish_year || doc.publisher?.[0]) && (
                            <div className="text-[11px] truncate" style={{ color: "#B0AA9C" }}>
                              {[doc.first_publish_year, doc.publisher?.[0]]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={onDismissSuggestions}
                      className="w-full text-center px-3 py-2 text-xs font-medium"
                      style={{ color: C.green }}
                    >
                      Can&apos;t find your book? Add it manually.
                    </button>
                  </div>
                )}

                {(searchState === "empty" || searchState === "error") && (
                  <div className="px-3 py-3 text-center">
                    <p className="text-sm" style={{ color: C.navy }}>
                      {searchState === "empty"
                        ? "No books found."
                        : "We couldn't search for books right now."}
                    </p>
                    <button
                      type="button"
                      onClick={onDismissSuggestions}
                      className="text-xs font-medium mt-1.5"
                      style={{ color: C.green }}
                    >
                      Add manually
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {titleError && <p className="text-xs mt-1 text-red-500">Title is required.</p>}
      </div>

      {duplicateBook && (
        <div
          className="mb-4 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3"
          style={{ background: C.orangeT }}
        >
          <p className="text-xs" style={{ color: C.navy }}>
            You already have <strong>{duplicateBook.title}</strong> in your library.
          </p>
          <button
            type="button"
            onClick={() => onViewDuplicate(duplicateBook)}
            className="text-xs font-semibold flex-shrink-0"
            style={{ color: C.orange }}
          >
            View it
          </button>
        </div>
      )}

      {(loadingEditions || editionOptions.length > 0) && (
        <div className="mb-4">
          <FieldLabel optional>Choose a different edition</FieldLabel>
          {loadingEditions ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
              <Loader2 size={13} className="animate-spin" /> Looking up editions...
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {editionOptions.map((edition, index) => (
                <button
                  key={edition.key || index}
                  type="button"
                  onClick={() => onApplyEdition(edition)}
                  className="flex-shrink-0 rounded-lg border px-2.5 py-1.5 text-left"
                  style={{ borderColor: C.tan }}
                >
                  <p className="text-xs font-medium" style={{ color: C.navy }}>
                    {edition.format || "Edition"}
                  </p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {[edition.publishDate, edition.publisher].filter(Boolean).join(" · ") || "—"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
