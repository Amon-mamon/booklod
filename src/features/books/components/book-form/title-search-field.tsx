"use client";

import { Book as BookIcon, Loader2 } from "lucide-react";
import { FieldLabel, TextInput } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import type { SearchState } from "../../hooks/use-book-search";
import { coverUrl, type OpenLibraryDoc } from "../../services/open-library";

interface TitleSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  searchState: SearchState;
  suggestions: OpenLibraryDoc[];
  isOpen: boolean;
  onFocus: () => void;
  onSelect: (doc: OpenLibraryDoc) => void;
  onDismiss: () => void;
}

export function TitleSearchField({
  value,
  onChange,
  hasError,
  searchState,
  suggestions,
  isOpen,
  onFocus,
  onSelect,
  onDismiss,
}: TitleSearchFieldProps) {
  return (
    <div className="mb-4 relative">
      <FieldLabel>Book Title</FieldLabel>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <TextInput
            invalid={hasError}
            placeholder="Search for a book..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
          />
          {searchState === "searching" && (
            <Loader2 size={16} className="animate-spin absolute right-3 top-2.5" style={{ color: colors.green }} />
          )}

          {isOpen && searchState !== "idle" && (
            <div
              className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg overflow-hidden"
              style={{ border: `1px solid ${colors.tan}` }}
            >
              {searchState === "searching" && (
                <div className="px-3 py-3 flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
                  <Loader2 size={14} className="animate-spin" /> Searching books...
                </div>
              )}

              {searchState === "results" && (
                <div className="max-h-72 overflow-y-auto">
                  {suggestions.map((doc, i) => (
                    <SuggestionRow key={doc.key || i} doc={doc} onSelect={onSelect} />
                  ))}
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="w-full text-center px-3 py-2 text-xs font-medium"
                    style={{ color: colors.green }}
                  >
                    Can&apos;t find your book? Add it manually.
                  </button>
                </div>
              )}

              {searchState === "empty" && (
                <SearchMessage message="No books found." onDismiss={onDismiss} />
              )}

              {searchState === "error" && (
                <SearchMessage message="We couldn't search for books right now." onDismiss={onDismiss} />
              )}
            </div>
          )}
        </div>
      </div>
      {hasError && <p className="text-xs mt-1 text-red-500">Title is required.</p>}
    </div>
  );
}

function SearchMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="px-3 py-3 text-center">
      <p className="text-sm" style={{ color: colors.navy }}>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs font-medium mt-1.5"
        style={{ color: colors.green }}
      >
        Add manually
      </button>
    </div>
  );
}

function SuggestionRow({ doc, onSelect }: { doc: OpenLibraryDoc; onSelect: (doc: OpenLibraryDoc) => void }) {
  const meta = [doc.first_publish_year, doc.publisher?.[0]].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      onClick={() => onSelect(doc)}
      className="w-full text-left px-3 py-2.5 hover:bg-[#F4EFE6] flex items-center gap-2.5 border-b last:border-b-0"
      style={{ borderColor: colors.tan }}
    >
      {doc.cover_i ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Open Library thumbnail, not worth optimizing
        <img src={coverUrl(doc.cover_i, "S")} className="w-8 h-11 object-cover rounded flex-shrink-0" alt="" />
      ) : (
        <div
          className="w-8 h-11 rounded flex-shrink-0 flex items-center justify-center"
          style={{ background: colors.cream }}
        >
          <BookIcon size={13} style={{ color: colors.muted }} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: colors.navy }}>{doc.title}</div>
        <div className="text-xs truncate" style={{ color: colors.muted }}>
          {doc.author_name?.join(", ") || "Unknown author"}
        </div>
        {meta && (
          <div className="text-[11px] truncate" style={{ color: colors.faint }}>{meta}</div>
        )}
      </div>
    </button>
  );
}
