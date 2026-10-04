/* eslint-disable @next/next/no-img-element -- covers are user-supplied data URLs or remote Open Library images */
import { Book as BookIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { FORMATS } from "../constants";
import { statusColor } from "../lib/status-style";
import type { Book } from "../types";

interface BookCoverProps {
  book: Book;
  width: number;
  height: number;
  iconSize: number;
  className?: string;
}

/** Cover image, or a tinted format icon when the book has no cover. */
export function BookCover({ book, width, height, iconSize, className }: BookCoverProps) {
  const FormatIcon = FORMATS[book.format]?.icon || BookIcon;
  const { color, tint } = statusColor(book);

  return (
    <div
      className={cn("flex-shrink-0 flex items-center justify-center overflow-hidden", className)}
      style={{ background: tint, width, height }}
    >
      {book.coverUrl ? (
        <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <FormatIcon size={iconSize} style={{ color }} />
      )}
    </div>
  );
}
