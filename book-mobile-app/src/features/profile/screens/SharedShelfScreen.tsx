import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { shareApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { BackHeader, Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Banner, Pill } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/TextField";
import { C, radius } from "@/theme";
import type { SharedShelf } from "@/types/booklod";
import { READING } from "@/utils/book-meta";

const CODE_PATTERN = /^[A-F0-9]{32}$/;

export function SharedShelfScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shelf, setShelf] = useState<SharedShelf | null>(null);

  async function lookup() {
    const clean = code.trim().toUpperCase();
    if (!CODE_PATTERN.test(clean)) {
      setError("Shelf codes are 32 letters and numbers.");
      return;
    }
    setLoading(true);
    setError("");
    setShelf(null);
    try {
      setShelf((await shareApi.view(clean)).shelf);
    } catch (e) {
      setError(errorMessage(e, "Unable to load that shared shelf."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackHeader title="View a Shared Shelf" />
      <AppText size={12} color={C.muted} style={{ marginBottom: 12 }}>
        Enter the code someone shared with you from their Booklod Plus account.
      </AppText>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <TextField
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-F0-9]/g, ""))}
          placeholder="32-character shelf code"
          maxLength={32}
          autoCapitalize="characters"
          autoCorrect={false}
          onSubmitEditing={lookup}
          returnKeyType="search"
          style={{ flex: 1, textAlign: "center", letterSpacing: 1 }}
        />
        <Button label="View" onPress={lookup} loading={loading} disabled={!code.trim()} />
      </View>
      {error ? <Banner message={error} /> : null}

      {shelf ? (
        <FlatList
          data={shelf.books}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ gap: 8, paddingBottom: 32 }}
          ListHeaderComponent={
            <AppText weight="medium" size={12} color={C.muted} style={{ marginBottom: 4 }}>
              {shelf.ownerName}&apos;s shelf · {shelf.books.length} books
            </AppText>
          }
          renderItem={({ item }) => {
            const reading = READING[item.readingStatus || "toread"];
            return (
              <View style={styles.item}>
                <AppText weight="medium">{item.title}</AppText>
                {item.author ? (
                  <AppText size={12} color={C.muted}>
                    {item.author}
                  </AppText>
                ) : null}
                <Pill color={reading.tint} textColor={reading.color} style={{ marginTop: 4 }}>
                  {reading.label}
                </Pill>
              </View>
            );
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: C.white, borderRadius: radius.sm, borderWidth: 1, borderColor: C.tan, paddingHorizontal: 12, paddingVertical: 8 },
});
