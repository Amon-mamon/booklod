"use client";
import { Book } from "lucide-react";
import { C } from "../../../app/components/theme";
import { FORMATS, statusColor } from "../../shared/shared";
import { Pill } from "../../../app/components/ui/Pill";
import type { BookRecord } from "../../shared/types";



// ---------------------------------------------------------------------------
// Book Card
// ---------------------------------------------------------------------------
interface BookCardProps {
  book: BookRecord;
  onClick: () => void;
}

export function cardStatusText(book: BookRecord): string {
  if (book.format === "Physical" && book.ownershipStatus === "lent")
    return book.ownershipDetail ? `Lent to ${book.ownershipDetail}` : "Lent Out";
  if (book.format === "Physical" && book.ownershipStatus === "given")
    return book.ownershipDetail ? `Given to ${book.ownershipDetail}` : "Given Away";
  if (book.format === "Physical" && book.ownershipStatus === "none") return "No longer have it";
  if (book.readingStatus === "done")
    return book.format === "Physical" ? "Finished · have it" : "Finished";
  if (book.readingStatus === "reading")
    return book.lastPageRead ? `Reading · p.${book.lastPageRead}` : "Reading";
  return "To Read";
}


export function BookCard({ book, onClick }: BookCardProps) {
  const FormatIcon = (book.format && FORMATS[book.format]?.icon) || Book;
  const { color, tint } = statusColor(book);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white p-3.5 flex gap-3 items-center shadow-sm hover:shadow-md transition"
      style={{ border: `1px solid ${C.tan}` }}
    >
      <div
        className="rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: tint, width: 44, height: 60 }}
      >
        {book.coverUrl ? (
          <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <FormatIcon size={18} style={{ color }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm leading-snug truncate" style={{ color: C.navy }}>
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs truncate mt-0.5" style={{ color: C.muted }}>
            {book.author}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <Pill color={tint} textColor={color}>
            {cardStatusText(book)}
          </Pill>
          <span className="text-[11px] flex items-center gap-1" style={{ color: "#B0AA9C" }}>
            <FormatIcon size={11} /> {book.format ? FORMATS[book.format]?.label : ""}
          </span>
        </div>
      </div>
    </button>
  );
}
