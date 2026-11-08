import { View } from "react-native";
import { Image } from "expo-image";
import { Book, BookMarked, Tablet } from "lucide-react-native";
import type { BookFormat, BookRecord } from "@/types/booklod";
import { statusColor } from "@/utils/book-meta";

/** Format icon (Physical / E-book / Kindle) as a static component. */
export function FormatIcon({ format, size, color }: { format?: BookFormat; size: number; color: string }) {
  if (format === "E-book") return <Tablet size={size} color={color} />;
  if (format === "Kindle") return <BookMarked size={size} color={color} />;
  return <Book size={size} color={color} />;
}

interface BookCoverProps {
  book: Pick<BookRecord, "coverUrl" | "format" | "readingStatus" | "ownershipStatus">;
  width: number;
  height: number;
  radius?: number;
  iconSize?: number;
}

export function BookCover({ book, width, height, radius = 6, iconSize = 18 }: BookCoverProps) {
  const { color, tint } = statusColor(book);
  return (
    <View
      style={{ width, height, borderRadius: radius, backgroundColor: tint, overflow: "hidden", alignItems: "center", justifyContent: "center" }}
    >
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={150} />
      ) : (
        <FormatIcon format={book.format} size={iconSize} color={color} />
      )}
    </View>
  );
}
