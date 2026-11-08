import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { C, radius } from "@/theme";
import { AppText } from "./AppText";

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ children, color, textColor = C.white, style }: { children: ReactNode; color: string; textColor?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pill, { backgroundColor: color }, style]}>
      <AppText weight="medium" size={12} color={textColor} numberOfLines={1}>
        {children}
      </AppText>
    </View>
  );
}

export function SectionHeading({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeading}>
      <AppText weight="semibold" size={14}>
        {children}
      </AppText>
      {action}
    </View>
  );
}

export function FieldLabel({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <AppText weight="medium" size={14} style={{ marginBottom: 4 }}>
      {children}
      {optional ? <AppText size={12} color={C.subtle}>{"  (optional)"}</AppText> : null}
    </AppText>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon size={20} color={C.green} />
      </View>
      <AppText weight="medium" style={{ textAlign: "center" }}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText size={12} color={C.subtle} style={{ textAlign: "center", marginTop: 4 }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

export function Banner({ message, tone = "error", onRetry }: { message: string; tone?: "error" | "info" | "success"; onRetry?: () => void }) {
  const bg = tone === "error" ? C.dangerT : tone === "success" ? C.greenT : C.orangeT;
  const fg = tone === "error" ? C.danger : C.navy;
  return (
    <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: bg }]}>
      <AppText size={12} color={fg} style={{ flex: 1 }}>
        {message}
      </AppText>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button">
          <AppText weight="semibold" size={12} color={fg}>
            Retry
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={C.green} />
    </View>
  );
}

/** Toggle switch styled like the web one (green on, tan off). */
export function Toggle({ value, onChange, disabled, label }: { value: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <Pressable
      onPress={onChange}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      style={[styles.toggle, { backgroundColor: value ? C.green : C.tan, opacity: disabled ? 0.6 : 1 }]}
    >
      <View style={[styles.knob, { transform: [{ translateX: value ? 20 : 0 }] }]} />
    </Pressable>
  );
}

/** Selectable chip/segment used for format, status and filters. */
export function Choice({
  label,
  active,
  onPress,
  activeColor = C.green,
  icon: Icon,
  style,
  rounded = "md",
  small,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor?: string;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  rounded?: "md" | "pill";
  small?: boolean;
}) {
  const fg = active ? C.white : C.navy;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.choice,
        {
          backgroundColor: active ? activeColor : C.white,
          borderColor: active ? activeColor : C.tan,
          borderRadius: rounded === "pill" ? radius.pill : radius.md,
          paddingVertical: small ? 6 : 9,
          paddingHorizontal: small ? 12 : 8,
        },
        style,
      ]}
    >
      {Icon ? <Icon size={14} color={fg} /> : null}
      <AppText weight="medium" size={small ? 12 : 13} color={fg} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: radius.lg, borderWidth: 1, borderColor: C.tan },
  pill: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.tan,
    borderRadius: radius.lg,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.cream, paddingVertical: 96 },
  toggle: { width: 44, height: 24, borderRadius: 12, padding: 2 },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white },
  choice: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1 },
});
