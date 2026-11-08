import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { C, radius } from "@/theme";
import { AppText } from "./AppText";
import { Button } from "./Button";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissable?: boolean;
}

/** Bottom sheet modal — the mobile equivalent of the web's modal cards. */
export function Sheet({ visible, onClose, children, dismissable = true }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissable ? onClose : undefined} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={dismissable ? onClose : undefined} accessibilityLabel="Close">
          <Pressable style={styles.card} onPress={() => {}} accessible={false}>
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  loading,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} dismissable={!loading}>
      {danger ? (
        <View style={styles.dangerIcon}>
          <AlertTriangle size={18} color={C.danger} />
        </View>
      ) : null}
      <AppText weight="semibold" size={16} style={{ marginBottom: 8 }}>
        {title}
      </AppText>
      {body ? (
        <AppText color={C.muted} style={{ lineHeight: 21 }}>
          {body}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        <Button label={cancelLabel} variant="outline" onPress={onClose} disabled={loading} style={styles.flex} />
        <Button label={confirmLabel} variant={danger ? "danger" : "primary"} onPress={onConfirm} loading={loading} style={styles.flex} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: C.backdrop, justifyContent: "flex-end", padding: 16 },
  card: { backgroundColor: C.white, borderRadius: radius.lg, padding: 20, maxHeight: "85%", width: "100%", maxWidth: 420, alignSelf: "center" },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.dangerT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 20 },
});
