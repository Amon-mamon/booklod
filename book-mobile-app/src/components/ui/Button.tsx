import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { C, radius } from "@/theme";
import { AppText } from "./AppText";

type Variant = "primary" | "navy" | "green" | "outline" | "danger" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  pill?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const BG: Record<Variant, string> = {
  primary: C.orange,
  navy: C.navy,
  green: C.green,
  outline: C.white,
  danger: C.danger,
  ghost: "transparent",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  pill,
  small,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const textColor = variant === "outline" ? C.navy : variant === "ghost" ? C.muted : C.white;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: BG[variant],
          borderRadius: pill ? radius.pill : radius.md,
          paddingVertical: small ? 8 : 12,
          paddingHorizontal: small ? 14 : 16,
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.row}>
          {icon}
          <AppText weight={variant === "outline" || variant === "ghost" ? "medium" : "semibold"} size={small ? 12 : 14} color={textColor}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", borderColor: C.tan, minHeight: 40 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
});
