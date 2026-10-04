"use client";

import { useMemo, useState } from "react";
import { Library as LibraryIcon, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { OWNERSHIP_ENTRIES, READING_ENTRIES } from "../constants";
import { useBooks } from "../context/books-provider";
import { filterBooks, type LibraryFilters } from "../lib/filter-books";
import { BookCard } from "./book-card";

const READING_FILTERS: { value: LibraryFilters["reading"]; label: string }[] = [
  { value: "all", label: "All" },
  ...READING_ENTRIES.map(([value, meta]) => ({ value, label: meta.label })),
];

const OWNERSHIP_FILTERS: { value: LibraryFilters["ownership"]; label: string }[] = [
  { value: "all", label: "All" },
  ...OWNERSHIP_ENTRIES.map(([value, meta]) => ({ value, label: meta.label })),
];

export function LibraryScreen() {
  const { books } = useBooks();
  const [query, setQuery] = useState("");
  const [ownership, setOwnership] = useState<LibraryFilters["ownership"]>("all");
  const [reading, setReading] = useState<LibraryFilters["reading"]>("all");

  const filtered = useMemo(
    () => filterBooks(books, { query, ownership, reading }),
    [books, query, ownership, reading]
  );

  return (
    <div className="max-w-xl mx-auto pb-6">
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-3" style={{ color: colors.subtle }} />
        <input
          className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none bg-white"
          style={{ border: `1px solid ${colors.tan}`, color: colors.navy }}
          placeholder="Search your library..."
          aria-label="Search your library"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <FilterChips
        options={READING_FILTERS}
        value={reading}
        onChange={setReading}
        activeColor={colors.navy}
        className="pb-2 mb-1"
      />
      <FilterChips
        options={OWNERSHIP_FILTERS}
        value={ownership}
        onChange={setOwnership}
        activeColor={colors.green}
        className="pb-3 mb-3"
      />

      {filtered.length === 0 ? (
        books.length === 0 ? (
          <EmptyState icon={LibraryIcon} title="Your shelf is empty" subtitle='Tap "Add Book" to log the first one.' />
        ) : (
          <EmptyState icon={Search} title="No books match" subtitle="Try a different search or filter." />
        )
      ) : (
        <div className="space-y-2.5">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} href={ROUTES.app.book(b.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  activeColor: string;
  className?: string;
}

function FilterChips<T extends string>({ options, value, onChange, activeColor, className }: FilterChipsProps<T>) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto -mx-1 px-1 ${className ?? ""}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: active ? activeColor : "white",
              color: active ? "white" : colors.navy,
              border: `1px solid ${active ? activeColor : colors.tan}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
