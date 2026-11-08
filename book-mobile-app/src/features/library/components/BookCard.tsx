import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Pill } from "@/components/ui/primitives";
import { C, radius } from "@/theme";
import type { BookRecord } from "@/types/booklod";
import { cardStatusText, FORMATS, statusColor } from "@/utils/book-meta";
import { BookCover, FormatIcon } from "./BookCover";

export const BookCard = memo(function BookCard({ book, onPress }: { book: BookRecord; onPress: () => void }) {
  const { color, tint } = statusColor(book);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${book.title}${book.author ? `, by ${book.author}` : ""}. ${cardStatusText(book)}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <BookCover book={book} width={44} height={60} />
      <View style={styles.body}>
        <AppText weight="medium" numberOfLines={1}>
          {book.title}
        </AppText>
        {book.author ? (
          <AppText size={12} color={C.muted} numberOfLines={1} style={{ marginTop: 2 }}>
            {book.author}
          </AppText>
        ) : null}
        <View style={styles.meta}>
          <Pill color={tint} textColor={color}>
            {cardStatusText(book)}
          </Pill>
          {book.format ? (
            <View style={styles.format}>
              <FormatIcon format={book.format} size={11} color={C.faint} />
              <AppText size={11} color={C.faint}>
                {FORMATS[book.format]?.label}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.tan,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  body: { flex: 1, minWidth: 0 },
  meta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 6 },
  format: { flexDirection: "row", alignItems: "center", gap: 4 },
});
