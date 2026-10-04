"use client";

import { colors } from "@/config/brand";
import type { Book } from "../../types";

export function DuplicateBanner({ book, onView }: { book: Book; onView?: (book: Book) => void }) {
  return (
    <div
      className="mb-4 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3"
      style={{ background: colors.orangeT }}
    >
      <p className="text-xs" style={{ color: colors.navy }}>
        You already have <strong>{book.title}</strong> in your library.
      </p>
      {onView && (
        <button
          type="button"
          onClick={() => onView(book)}
          className="text-xs font-semibold flex-shrink-0"
          style={{ color: colors.orange }}
        >
          View it
        </button>
      )}
    </div>
  );
}
