import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Book } from "lucide-react-native";
import { booksApi } from "@/api/endpoints";
import { AppText } from "@/components/ui/AppText";
import { FieldLabel } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/TextField";
import { C, radius } from "@/theme";
import type { BookEdition, BookRecord, BookSearchResult } from "@/types/booklod";

const SEARCH_MIN_CHARS = 5;
type SearchState = "idle" | "searching" | "results" | "empty" | "error";

interface BookLookupProps {
  title: string;
  titleError: boolean;
  searchEnabled: boolean;
  duplicateBook: BookRecord | null;
  editions: BookEdition[];
  loadingEditions: boolean;
  onTitleChange: (value: string) => void;
  onApplyResult: (result: BookSearchResult) => void;
  onApplyEdition: (edition: BookEdition) => void;
  onViewDuplicate: (book: BookRecord) => void;
}

/** Title field with Open Library suggestions (via the Booklod API). */
export function BookLookup({
  title,
  titleError,
  searchEnabled,
  duplicateBook,
  editions,
  loadingEditions,
  onTitleChange,
  onApplyResult,
  onApplyEdition,
  onViewDuplicate,
}: BookLookupProps) {
  const [searchState, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const skipNext = useRef(false);

  const query = title.trim();
  const searchActive = searchEnabled && query.length >= SEARCH_MIN_CHARS;
  // Short titles show no suggestions; derive that instead of storing it.
  const state: SearchState = searchActive ? searchState : "idle";

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (!searchActive) return;
    let active = true;
    const timer = setTimeout(async () => {
      setState("searching");
      setOpen(true);
      try {
        const { results: found } = await booksApi.search(query);
        if (!active) return;
        setResults(found);
        setState(found.length ? "results" : "empty");
      } catch {
        if (active) setState("error");
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, searchActive]);

  function pick(result: BookSearchResult) {
    // Applying a result changes the title; don't search again for it.
    skipNext.current = Boolean(result.title) && result.title.trim() !== query;
    setOpen(false);
    setResults([]);
    onApplyResult(result);
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel>Book Title</FieldLabel>
      <View style={{ justifyContent: "center" }}>
        <TextField
          value={title}
          onChangeText={onTitleChange}
          placeholder={searchEnabled ? "Search for a book..." : "Book title"}
          invalid={titleError}
          accessibilityLabel="Book title"
          onFocus={() => state !== "idle" && setOpen(true)}
          style={{ paddingRight: 36 }}
        />
        {state === "searching" ? <ActivityIndicator size="small" color={C.green} style={styles.spinner} /> : null}
      </View>
      {titleError ? (
        <AppText size={12} color="#D64545" style={{ marginTop: 4 }}>
          Title is required.
        </AppText>
      ) : null}

      {open && searchActive && state !== "idle" ? (
        <View style={styles.dropdown}>
          {state === "searching" ? (
            <AppText color={C.muted} style={{ padding: 12 }}>
              Searching books...
            </AppText>
          ) : null}
          {state === "results"
            ? results.map((r, i) => (
                <Pressable key={r.workKey || i} onPress={() => pick(r)} style={({ pressed }) => [styles.result, pressed && { backgroundColor: "#F4EFE6" }]} accessibilityRole="button">
                  {r.coverThumbUrl ? (
                    <Image source={{ uri: r.coverThumbUrl }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbEmpty]}>
                      <Book size={13} color={C.muted} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <AppText weight="medium" numberOfLines={1}>
                      {r.title}
                    </AppText>
                    <AppText size={12} color={C.muted} numberOfLines={1}>
                      {r.authors.join(", ") || "Unknown author"}
                    </AppText>
                    {r.firstPublishYear || r.publisher ? (
                      <AppText size={11} color={C.faint} numberOfLines={1}>
                        {[r.firstPublishYear, r.publisher].filter(Boolean).join(" · ")}
                      </AppText>
                    ) : null}
                  </View>
                </Pressable>
              ))
            : null}
          {state === "empty" || state === "error" ? (
            <AppText style={{ padding: 12, textAlign: "center" }}>
              {state === "empty" ? "No books found." : "We couldn't search for books right now."}
            </AppText>
          ) : null}
          {state !== "searching" ? (
            <Pressable onPress={() => setOpen(false)} style={{ padding: 10 }}>
              <AppText weight="medium" size={12} color={C.green} style={{ textAlign: "center" }}>
                {state === "results" ? "Can't find your book? Add it manually." : "Add manually"}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {duplicateBook ? (
        <View style={styles.duplicate}>
          <AppText size={12} style={{ flex: 1 }}>
            You already have <AppText weight="semibold" size={12}>{duplicateBook.title}</AppText> in your library.
          </AppText>
          <Pressable onPress={() => onViewDuplicate(duplicateBook)} hitSlop={8}>
            <AppText weight="semibold" size={12} color={C.orange}>
              View it
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {loadingEditions || editions.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <FieldLabel optional>Choose a different edition</FieldLabel>
          {loadingEditions ? (
            <AppText size={12} color={C.muted}>
              Looking up editions...
            </AppText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {editions.map((ed, i) => (
                <Pressable key={ed.key || i} onPress={() => onApplyEdition(ed)} style={styles.edition} accessibilityRole="button">
                  <AppText weight="medium" size={12}>
                    {ed.format || "Edition"}
                  </AppText>
                  <AppText size={11} color={C.muted}>
                    {[ed.publishDate, ed.publisher].filter(Boolean).join(" · ") || "—"}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: { position: "absolute", right: 12 },
  dropdown: { marginTop: 4, backgroundColor: C.white, borderRadius: radius.md, borderWidth: 1, borderColor: C.tan, overflow: "hidden" },
  result: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.tan },
  thumb: { width: 32, height: 44, borderRadius: 4 },
  thumbEmpty: { backgroundColor: C.cream, alignItems: "center", justifyContent: "center" },
  duplicate: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, backgroundColor: C.orangeT, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  edition: { borderWidth: 1, borderColor: C.tan, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.white },
});
