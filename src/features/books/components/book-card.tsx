import Link from "next/link";
import { Book as BookIcon } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { colors } from "@/config/brand";
import { FORMATS } from "../constants";
import { cardStatusText, statusColor } from "../lib/status-style";
import type { Book } from "../types";
import { BookCover } from "./book-cover";

interface BookCardProps {
  book: Book;
  /** Omit for a non-interactive card (e.g. marketing previews). */
  href?: string;
}

export function BookCard({ book, href }: BookCardProps) {
  const FormatIcon = FORMATS[book.format]?.icon || BookIcon;
  const { color, tint } = statusColor(book);

  const className =
    "w-full text-left rounded-2xl bg-white p-3.5 flex gap-3 items-center shadow-sm hover:shadow-md transition";
  const style = { border: `1px solid ${colors.tan}` };

  const content = (
    <>
      <BookCover book={book} width={44} height={60} iconSize={18} className="rounded-md" />
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm leading-snug truncate" style={{ color: colors.navy }}>
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs truncate mt-0.5" style={{ color: colors.muted }}>{book.author}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <Pill color={tint} textColor={color}>{cardStatusText(book)}</Pill>
          <span className="text-[11px] flex items-center gap-1" style={{ color: colors.faint }}>
            <FormatIcon size={11} /> {FORMATS[book.format]?.label}
          </span>
        </div>
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={className} style={style}>{content}</Link>
  ) : (
    <div className={className} style={style}>{content}</div>
  );
}
