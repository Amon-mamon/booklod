"use client";
import { Pencil, ArrowLeft, Book } from "lucide-react";
import { C } from "../../../app/components/theme";
import { FORMATS, OWNERSHIP, READING, fmtDate, statusColor } from "../../shared/shared";
import type { BookRecord } from "../../shared/types";



// ---------------------------------------------------------------------------
// Book Detail
// ---------------------------------------------------------------------------
interface BookDetailProps {
  book: BookRecord;
  onBack: () => void;
  onEdit: () => void;
  onQuickLend: () => void;
}

export function BookDetail({ book, onBack, onEdit, onQuickLend }: BookDetailProps) {
  const FormatIcon = (book.format && FORMATS[book.format]?.icon) || Book;
  const { color, tint } = statusColor(book);
  const ownership =
    book.format === "Physical" && book.ownershipStatus
      ? OWNERSHIP[book.ownershipStatus]
      : null;
  const canLendIt = book.format === "Physical" && book.ownershipStatus === "have";

  return (
    <div className="max-w-xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 transition" style={{ color: C.navy }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <div
        className="rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden mx-auto mb-3"
        style={{ background: tint, width: 76, height: 104 }}
      >
        {book.coverUrl ? (
          <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <FormatIcon size={28} style={{ color }} />
        )}
      </div>
      <h2 className="text-lg font-semibold leading-snug text-center" style={{ color: C.navy }}>
        {book.title}
      </h2>
      {book.subtitle && (
        <p className="text-sm text-center mt-0.5" style={{ color: C.muted }}>{book.subtitle}</p>
      )}
      {(book.author || book.format) && (
        <p className="text-sm mt-0.5 text-center" style={{ color: C.muted }}>
          {book.author}
          {book.author ? " · " : ""}
          {book.format ? FORMATS[book.format]?.label : ""}
        </p>
      )}

      <div className="flex gap-2 mt-4 mb-5">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-white"
          style={{ background: C.navy }}
        >
          <Pencil size={14} /> Edit status
        </button>
        {canLendIt ? (
          <button
            onClick={onQuickLend}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium border"
            style={{ borderColor: C.tan, color: C.navy }}
          >
            Lend it
          </button>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-3.5 flex flex-col gap-2.5 text-sm mb-4" style={{ border: `1px solid ${C.tan}` }}>
        <InfoLine
          label="Status"
          value={READING[book.readingStatus || "toread"].label}
          valueColor={color}
        />
        {book.startDate && <InfoLine label="Started" value={fmtDate(book.startDate)} />}
        {book.endDate && <InfoLine label="Finished" value={fmtDate(book.endDate)} />}
        {book.readingStatus === "reading" && book.lastPageRead !== "" && book.lastPageRead != null && (
          <InfoLine label="Last page read" value={`p. ${book.lastPageRead}`} bold />
        )}
        {book.format === "Physical" && (
          <InfoLine
            label="Have it?"
            value={
              book.ownershipStatus === "have"
                ? book.ownershipDetail
                  ? `Yes — ${book.ownershipDetail}`
                  : "Yes"
                : ownership?.label
            }
            valueColor={ownership?.color}
            bold
          />
        )}
        {ownership && book.ownershipStatus !== "have" && book.ownershipDetail && (
          <InfoLine label={ownership.field} value={book.ownershipDetail} />
        )}
      </div>

      {(book.review || book.notes) && (
        <div className="rounded-xl bg-white p-3.5 mb-4" style={{ border: `1px solid ${C.tan}` }}>
          {book.review && (
            <>
              <p className="text-xs mb-1" style={{ color: C.muted }}>Review</p>
              <p className="text-sm italic mb-3" style={{ color: C.navy, whiteSpace: "pre-wrap" }}>
                &quot;{book.review}&quot;
              </p>
            </>
          )}
          {book.notes && (
            <>
              <p className="text-xs mb-1" style={{ color: C.muted }}>Notes</p>
              <p className="text-sm italic" style={{ color: C.navy, whiteSpace: "pre-wrap" }}>
                &quot;{book.notes}&quot;
              </p>
            </>
          )}
        </div>
      )}

      {(book.publisher ||
        book.edition ||
        book.editionFormat ||
        book.pubDate ||
        book.isbn13 ||
        book.isbn10 ||
        book.isbn ||
        book.pageCount ||
        book.language ||
        book.description) && (
        <div className="rounded-xl bg-white p-3.5" style={{ border: `1px solid ${C.tan}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>
            Edition Details
          </p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {book.publisher && <DetailRow label="Publisher" value={book.publisher} compact />}
            {book.edition && <DetailRow label="Edition" value={book.edition} compact />}
            {book.editionFormat && <DetailRow label="Binding" value={book.editionFormat} compact />}
            {book.pubDate && <DetailRow label="Published" value={book.pubDate} compact />}
            {(book.isbn13 || (!book.isbn10 && book.isbn)) && (
              <DetailRow label="ISBN-13" value={book.isbn13 || book.isbn} compact />
            )}
            {book.isbn10 && <DetailRow label="ISBN-10" value={book.isbn10} compact />}
            {book.pageCount && <DetailRow label="Pages" value={book.pageCount} compact />}
            {book.language && <DetailRow label="Language" value={book.language} compact />}
          </div>
          {book.description && (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.tan}` }}>
              <p className="text-xs mb-1" style={{ color: C.muted }}>Description</p>
              <p className="text-sm" style={{ color: C.navy, whiteSpace: "pre-wrap" }}>{book.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


interface InfoLineProps {
  label: string;
  value?: string | number;
  valueColor?: string;
  bold?: boolean;
}

export function InfoLine({ label, value, valueColor, bold }: InfoLineProps) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color: valueColor || C.navy, fontWeight: bold ? 600 : 500 }}>{value}</span>
    </div>
  );
}


interface DetailRowProps {
  label: string;
  value?: string | number;
  multiline?: boolean;
  compact?: boolean;
}

export function DetailRow({ label, value, multiline, compact }: DetailRowProps) {
  return (
    <div>
      <p className="text-xs font-medium mb-0.5" style={{ color: "#9A958D" }}>{label}</p>
      <p
        className={`text-sm ${compact ? "" : ""}`}
        style={{ color: C.navy, whiteSpace: multiline ? "pre-wrap" : "normal" }}
      >
        {value}
      </p>
    </div>
  );
}
