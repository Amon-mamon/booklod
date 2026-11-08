import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/LogoMark";
import { C } from "@/theme";

/** Cream page background with safe-area padding at the top. */
export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>{children}</View>;
}

/** App header used on the tab screens: wordmark + optional "Add Book". */
export function AppHeader({ showAdd }: { showAdd?: boolean }) {
  return (
    <View style={styles.header}>
      <Wordmark />
      {showAdd ? (
        <Button label="Add Book" pill small icon={<Plus size={16} color="white" />} onPress={() => router.push("/books/new")} />
      ) : null}
    </View>
  );
}

/** Back arrow + optional title, used on stacked screens. */
export function BackHeader({ title, right }: { title?: string; right?: ReactNode }) {
  return (
    <View style={styles.backHeader}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/library"))}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={styles.backButton}
      >
        <ArrowLeft size={20} color={C.navy} />
      </Pressable>
      {title ? (
        <AppText weight="semibold" size={20} style={{ flex: 1 }}>
          {title}
        </AppText>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  backButton: { padding: 8, marginLeft: -8, borderRadius: 999 },
});
