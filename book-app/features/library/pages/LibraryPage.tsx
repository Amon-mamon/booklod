"use client";
import { useState } from "react";
import { Search, Library as LibraryIcon } from "lucide-react";
import { C } from "../../../app/components/theme";
import { OWNERSHIP, READING } from "../../shared/shared";
import { EmptyState } from "../components/ReadingDigest";
import { BookCard } from "../components/BookCard";
import type { BookRecord } from "../../shared/types";



// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------
export const OWNERSHIP_FILTERS = ["All", "Have It", "Lent Out", "Given Away", "No Longer Have It"];


export const READING_FILTERS = ["All", "To Read", "Reading", "Done Reading"];


/**
 * @param {{
 *   books: import("../shared/types").BookRecord[],
 *   onOpen: (book: import("../shared/types").BookRecord) => void,
 *   onAdd: () => void
 * }} props
 */
interface LibraryProps {
  books: BookRecord[];
  onOpen: (book: BookRecord) => void;
}

export function Library({ books, onOpen }: LibraryProps) {
  const [query, setQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("All");
  const [readingFilter, setReadingFilter] = useState("All");

  const filtered = books.filter((b) => {
    const matchesQuery =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(query.toLowerCase());
    const matchesOwnership =
      ownershipFilter === "All" ||
      (b.format === "Physical" &&
        !!b.ownershipStatus &&
        OWNERSHIP[b.ownershipStatus]?.label === ownershipFilter);
    const matchesReading =
      readingFilter === "All" ||
      READING[b.readingStatus || "toread"]?.label === readingFilter;
    return matchesQuery && matchesOwnership && matchesReading;
  });

  return (
    <div className="max-w-xl mx-auto pb-6">
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-3" style={{ color: "#9A958D" }} />
        <input
          className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none bg-white"
          style={{ border: `1px solid ${C.tan}`, color: C.navy }}
          placeholder="Search your library..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 -mx-1 px-1">
        {READING_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setReadingFilter(f)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: readingFilter === f ? C.navy : "white",
              color: readingFilter === f ? "white" : C.navy,
              border: `1px solid ${readingFilter === f ? C.navy : C.tan}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
        {OWNERSHIP_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setOwnershipFilter(f)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: ownershipFilter === f ? C.green : "white",
              color: ownershipFilter === f ? "white" : C.navy,
              border: `1px solid ${ownershipFilter === f ? C.green : C.tan}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        books.length === 0 ? (
          <EmptyState
            icon={LibraryIcon}
            title="Your shelf is empty"
            subtitle='Tap "Add Book" to log the first one.'
          />
        ) : (
          <EmptyState icon={Search} title="No books match" subtitle="Try a different search or filter." />
        )
      ) : (
        <div className="space-y-2.5">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} onClick={() => onOpen(b)} />
          ))}
        </div>
      )}
    </div>
  );
}
