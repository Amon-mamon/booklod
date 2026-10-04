import { colors } from "@/config/brand";
import type { Book } from "../types";

/** Overall "vibe" colour for a book — drives the icon-badge tint on cards. */
export function statusColor(book: Book): { color: string; tint: string } {
  if (book.readingStatus === "reading") return { color: colors.orange, tint: colors.orangeT };
  if (book.format === "Physical" && (book.ownershipStatus === "lent" || book.ownershipStatus === "given"))
    return { color: colors.navy, tint: colors.navyT };
  if (book.readingStatus === "done") return { color: colors.green, tint: colors.greenT };
  return { color: colors.navy, tint: colors.navyT };
}

export function cardStatusText(book: Book): string {
  if (book.format === "Physical" && book.ownershipStatus === "lent")
    return book.ownershipDetail ? `Lent to ${book.ownershipDetail}` : "Lent Out";
  if (book.format === "Physical" && book.ownershipStatus === "given")
    return book.ownershipDetail ? `Given to ${book.ownershipDetail}` : "Given Away";
  if (book.format === "Physical" && book.ownershipStatus === "none") return "No longer have it";
  if (book.readingStatus === "done") return book.format === "Physical" ? "Finished · have it" : "Finished";
  if (book.readingStatus === "reading")
    return book.lastPageRead ? `Reading · p.${book.lastPageRead}` : "Reading";
  return "To Read";
}
