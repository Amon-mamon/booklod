import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Toggle } from "@/components/ui/primitives";
import { C } from "@/theme";

const divider = (last?: boolean) => ({ borderBottomWidth: last ? 0 : 1, borderBottomColor: C.tan });

export function NavRow({ icon: Icon, label, value, onPress, last, danger }: { icon?: LucideIcon; label: string; value?: ReactNode; onPress: () => void; last?: boolean; danger?: boolean }) {
  const color = danger ? C.danger : C.navy;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, divider(last), pressed && { backgroundColor: "#FAF7F1" }]}>
      <View style={styles.left}>
        {Icon ? <Icon size={15} color={danger ? C.danger : C.muted} /> : null}
        <AppText color={color}>{label}</AppText>
      </View>
      <View style={styles.left}>
        {typeof value === "string" ? (
          <AppText color={C.muted} numberOfLines={1} style={{ maxWidth: 180 }}>
            {value}
          </AppText>
        ) : (
          value
        )}
        <ChevronRight size={14} color={danger ? "#D9A0A0" : C.muted} />
      </View>
    </Pressable>
  );
}

export function ToggleRow({ label, hint, value, onChange, last, disabled }: { label: string; hint?: string; value: boolean; onChange: () => void; last?: boolean; disabled?: boolean }) {
  return (
    <View style={[styles.row, divider(last)]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText>{label}</AppText>
        {hint ? (
          <AppText size={12} color={C.muted} style={{ marginTop: 2 }}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Toggle value={value} onChange={onChange} label={label} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },
});
