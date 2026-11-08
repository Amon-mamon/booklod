import { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Library as LibraryIcon, Search } from "lucide-react-native";
import { errorMessage } from "@/api/client";
import { AppHeader, Screen } from "@/components/layout/Screen";
import { Banner, Choice, EmptyState, LoadingView } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/TextField";
import { C } from "@/theme";
import { filterBooks, OWNERSHIP_FILTERS, READING_FILTERS } from "@/utils/book-meta";
import { BookCard } from "../components/BookCard";
import { useLibrary } from "../hooks/useLibrary";
import { useAppSettings } from "@/features/profile/hooks/useProfile";

export function LibraryScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useLibrary();
  const { data: settings } = useAppSettings();
  const [query, setQuery] = useState("");
  const [readingFilter, setReadingFilter] = useState<string>("All");
  const [ownershipFilter, setOwnershipFilter] = useState<string>("All");

  const books = useMemo(() => data?.books ?? [], [data]);
  const filtered = useMemo(
    () => filterBooks(books, query, readingFilter, ownershipFilter),
    [books, query, readingFilter, ownershipFilter],
  );

  return (
    <Screen>
      <AppHeader showAdd />
      {isLoading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => <BookCard book={item} onPress={() => router.push(`/books/${item.id}`)} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={C.green} />}
          ListHeaderComponent={
            <View>
              {settings?.announcement_enabled && settings.announcement_text ? (
                <Banner tone="success" message={settings.announcement_text} />
              ) : null}
              {error ? <Banner message={errorMessage(error, "Unable to load your library.")} onRetry={refetch} /> : null}
              <View style={styles.search}>
                <Search size={16} color={C.subtle} style={styles.searchIcon} />
                <TextField
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search your library..."
                  accessibilityLabel="Search your library"
                  returnKeyType="search"
                  style={{ paddingLeft: 36 }}
                />
              </View>
              <ChipRow options={READING_FILTERS} value={readingFilter} onChange={setReadingFilter} color={C.navy} />
              <ChipRow options={OWNERSHIP_FILTERS} value={ownershipFilter} onChange={setOwnershipFilter} color={C.green} />
              <View style={{ height: 12 }} />
            </View>
          }
          ListEmptyComponent={
            error ? undefined : books.length === 0 ? (
              <EmptyState icon={LibraryIcon} title="Your shelf is empty" subtitle='Tap "Add Book" to log the first one.' />
            ) : (
              <EmptyState icon={Search} title="No books match" subtitle="Try a different search or filter." />
            )
          }
        />
      )}
    </Screen>
  );
}

function ChipRow({
  options,
  value,
  onChange,
  color,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {options.map((option) => (
        <Choice key={option} label={option} active={value === option} onPress={() => onChange(option)} activeColor={color} rounded="pill" small />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  search: { justifyContent: "center", marginBottom: 12 },
  searchIcon: { position: "absolute", left: 12, zIndex: 1 },
  chips: { gap: 6, paddingBottom: 8 },
});
