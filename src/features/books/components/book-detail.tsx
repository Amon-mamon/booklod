import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { formatDate } from "@/lib/date";
import { FORMATS, OWNERSHIP, READING } from "../constants";
import { statusColor } from "../lib/status-style";
import type { Book } from "../types";
import { BookCover } from "./book-cover";

export function BookDetail({ book }: { book: Book }) {
  const { color } = statusColor(book);
  const ownership = book.format === "Physical" && book.ownershipStatus ? OWNERSHIP[book.ownershipStatus] : null;
  const canLendIt = book.format === "Physical" && book.ownershipStatus === "have";

  const hasEditionDetails = !!(
    book.publisher ||
    book.edition ||
    book.editionFormat ||
    book.pubDate ||
    book.isbn13 ||
    book.isbn10 ||
    book.isbn ||
    book.pageCount ||
    book.language ||
    book.description
  );

  return (
    <div className="max-w-xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-5">
        <Link
          href={ROUTES.app.library}
          aria-label="Back to library"
          className="p-2 rounded-full hover:bg-black/5 transition"
          style={{ color: colors.navy }}
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <BookCover book={book} width={76} height={104} iconSize={28} className="rounded-xl mx-auto mb-3" />
      <h2 className="text-lg font-semibold leading-snug text-center" style={{ color: colors.navy }}>
        {book.title}
      </h2>
      {book.subtitle && (
        <p className="text-sm text-center mt-0.5" style={{ color: colors.muted }}>{book.subtitle}</p>
      )}
      {(book.author || book.format) && (
        <p className="text-sm mt-0.5 text-center" style={{ color: colors.muted }}>
          {book.author}
          {book.author ? " · " : ""}
          {FORMATS[book.format]?.label}
        </p>
      )}

      <div className="flex gap-2 mt-4 mb-5">
        <Link
          href={ROUTES.app.editBook(book.id)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-white"
          style={{ background: colors.navy }}
        >
          <Pencil size={14} /> Edit status
        </Link>
        {canLendIt && (
          <Link
            href={ROUTES.app.editBook(book.id, { lend: true })}
            className="flex-1 text-center rounded-xl py-2.5 text-sm font-medium border"
            style={{ borderColor: colors.tan, color: colors.navy }}
          >
            Lend it
          </Link>
        )}
      </div>

      <div
        className="rounded-xl bg-white p-3.5 flex flex-col gap-2.5 text-sm mb-4"
        style={{ border: `1px solid ${colors.tan}` }}
      >
        <InfoLine label="Status" value={READING[book.readingStatus].label} valueColor={color} />
        {book.startDate && <InfoLine label="Started" value={formatDate(book.startDate)} />}
        {book.endDate && <InfoLine label="Finished" value={formatDate(book.endDate)} />}
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
        <div className="rounded-xl bg-white p-3.5 mb-4" style={{ border: `1px solid ${colors.tan}` }}>
          {book.review && (
            <>
              <p className="text-xs mb-1" style={{ color: colors.muted }}>Review</p>
              <p className="text-sm italic mb-3" style={{ color: colors.navy, whiteSpace: "pre-wrap" }}>
                &ldquo;{book.review}&rdquo;
              </p>
            </>
          )}
          {book.notes && (
            <>
              <p className="text-xs mb-1" style={{ color: colors.muted }}>Notes</p>
              <p className="text-sm italic" style={{ color: colors.navy, whiteSpace: "pre-wrap" }}>
                &ldquo;{book.notes}&rdquo;
              </p>
            </>
          )}
        </div>
      )}

      {hasEditionDetails && (
        <div className="rounded-xl bg-white p-3.5" style={{ border: `1px solid ${colors.tan}` }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: colors.muted }}>
            Edition Details
          </p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {book.publisher && <DetailRow label="Publisher" value={book.publisher} />}
            {book.edition && <DetailRow label="Edition" value={book.edition} />}
            {book.editionFormat && <DetailRow label="Binding" value={book.editionFormat} />}
            {book.pubDate && <DetailRow label="Published" value={book.pubDate} />}
            {(book.isbn13 || (!book.isbn10 && book.isbn)) && (
              <DetailRow label="ISBN-13" value={book.isbn13 || book.isbn} />
            )}
            {book.isbn10 && <DetailRow label="ISBN-10" value={book.isbn10} />}
            {book.pageCount && <DetailRow label="Pages" value={book.pageCount} />}
            {book.language && <DetailRow label="Language" value={book.language} />}
          </div>
          {book.description && (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${colors.tan}` }}>
              <p className="text-xs mb-1" style={{ color: colors.muted }}>Description</p>
              <p className="text-sm" style={{ color: colors.navy, whiteSpace: "pre-wrap" }}>{book.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoLine({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  bold?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ color: valueColor || colors.navy, fontWeight: bold ? 600 : 500 }}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium mb-0.5" style={{ color: colors.subtle }}>{label}</p>
      <p className="text-sm" style={{ color: colors.navy }}>{value}</p>
    </div>
  );
}
