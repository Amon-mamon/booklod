import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BookX, Pencil } from "lucide-react-native";
import { errorMessage } from "@/api/client";
import { BackHeader, Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Banner, Card, EmptyState, LoadingView } from "@/components/ui/primitives";
import { C } from "@/theme";
import { fmtDate } from "@/utils/dates";
import { FORMATS, OWNERSHIP, READING, statusColor } from "@/utils/book-meta";
import { BookCover } from "../components/BookCover";
import { useBook } from "../hooks/useLibrary";

export function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { book, isLoading, error, refetch } = useBook(id);

  if (isLoading) return <LoadingView />;

  if (!book) {
    return (
      <Screen>
        <BackHeader />
        {error ? (
          <Banner message={errorMessage(error, "Unable to load this book.")} onRetry={refetch} />
        ) : (
          <EmptyState icon={BookX} title="Book not found" subtitle="It may have been deleted on another device." />
        )}
      </Screen>
    );
  }

  const { color } = statusColor(book);
  const ownership = book.format === "Physical" && book.ownershipStatus ? OWNERSHIP[book.ownershipStatus] : null;
  const canLend = book.format === "Physical" && book.ownershipStatus === "have";
  const hasEdition = Boolean(
    book.publisher || book.edition || book.editionFormat || book.pubDate || book.isbn13 || book.isbn10 || book.isbn || book.pageCount || book.language || book.description,
  );

  return (
    <Screen>
      <BackHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <BookCover book={book} width={76} height={104} radius={12} iconSize={28} />
        </View>
        <AppText weight="semibold" size={18} style={styles.center}>
          {book.title}
        </AppText>
        {book.subtitle ? (
          <AppText color={C.muted} style={styles.center}>
            {book.subtitle}
          </AppText>
        ) : null}
        {book.author || book.format ? (
          <AppText color={C.muted} style={styles.center}>
            {[book.author, book.format ? FORMATS[book.format]?.label : ""].filter(Boolean).join(" · ")}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <Button
            label="Edit status"
            variant="navy"
            icon={<Pencil size={14} color="white" />}
            onPress={() => router.push(`/books/${book.id}/edit`)}
            style={{ flex: 1 }}
          />
          {canLend ? (
            <Button label="Lend it" variant="outline" onPress={() => router.push(`/books/${book.id}/edit?lend=1`)} style={{ flex: 1 }} />
          ) : null}
        </View>

        <Card style={styles.section}>
          <InfoLine label="Status" value={READING[book.readingStatus || "toread"].label} valueColor={color} />
          {book.startDate ? <InfoLine label="Started" value={fmtDate(book.startDate)} /> : null}
          {book.endDate ? <InfoLine label="Finished" value={fmtDate(book.endDate)} /> : null}
          {book.readingStatus === "reading" && book.lastPageRead !== "" && book.lastPageRead != null ? (
            <InfoLine label="Last page read" value={`p. ${book.lastPageRead}`} bold />
          ) : null}
          {book.format === "Physical" ? (
            <InfoLine
              label="Have it?"
              value={book.ownershipStatus === "have" ? (book.ownershipDetail ? `Yes — ${book.ownershipDetail}` : "Yes") : ownership?.label}
              valueColor={ownership?.color}
              bold
            />
          ) : null}
          {ownership && book.ownershipStatus !== "have" && book.ownershipDetail ? (
            <InfoLine label={ownership.field} value={book.ownershipDetail} />
          ) : null}
        </Card>

        {book.review || book.notes ? (
          <Card style={styles.section}>
            {book.review ? <Quote label="Review" text={book.review} /> : null}
            {book.notes ? <Quote label="Notes" text={book.notes} /> : null}
          </Card>
        ) : null}

        {hasEdition ? (
          <Card style={styles.section}>
            <AppText weight="semibold" size={12} color={C.muted} style={styles.caps}>
              Edition Details
            </AppText>
            <View style={styles.grid}>
              {book.publisher ? <DetailRow label="Publisher" value={book.publisher} /> : null}
              {book.edition ? <DetailRow label="Edition" value={book.edition} /> : null}
              {book.editionFormat ? <DetailRow label="Binding" value={book.editionFormat} /> : null}
              {book.pubDate ? <DetailRow label="Published" value={book.pubDate} /> : null}
              {book.isbn13 || (!book.isbn10 && book.isbn) ? <DetailRow label="ISBN-13" value={book.isbn13 || book.isbn} /> : null}
              {book.isbn10 ? <DetailRow label="ISBN-10" value={book.isbn10} /> : null}
              {book.pageCount ? <DetailRow label="Pages" value={book.pageCount} /> : null}
              {book.language ? <DetailRow label="Language" value={book.language} /> : null}
            </View>
            {book.description ? (
              <View style={styles.description}>
                <AppText size={12} color={C.muted} style={{ marginBottom: 4 }}>
                  Description
                </AppText>
                <AppText>{book.description}</AppText>
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function InfoLine({ label, value, valueColor, bold }: { label: string; value?: string | number; valueColor?: string; bold?: boolean }) {
  if (!value) return null;
  return (
    <View style={styles.infoLine}>
      <AppText color={C.muted}>{label}</AppText>
      <AppText weight={bold ? "semibold" : "medium"} color={valueColor || C.navy} style={{ flexShrink: 1, textAlign: "right" }}>
        {value}
      </AppText>
    </View>
  );
}

function Quote({ label, text }: { label: string; text: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <AppText size={12} color={C.muted} style={{ marginBottom: 4 }}>
        {label}
      </AppText>
      <AppText style={{ fontStyle: "italic" }}>&quot;{text}&quot;</AppText>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={{ width: "50%", paddingRight: 12, marginBottom: 8 }}>
      <AppText weight="medium" size={12} color={C.subtle}>
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: "center", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 20 },
  section: { padding: 14, gap: 10, marginBottom: 16, borderRadius: 12 },
  infoLine: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  caps: { textTransform: "uppercase", letterSpacing: 0.6 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  description: { borderTopWidth: 1, borderTopColor: C.tan, paddingTop: 12 },
});
