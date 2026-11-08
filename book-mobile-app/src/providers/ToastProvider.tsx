import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertTriangle, Check, X } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { C, radius } from "@/theme";

type ToastType = "success" | "error";
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, type: ToastType = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    timer.current = setTimeout(() => setToast(null), 2800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 84 }]}>
          <View
            accessibilityRole={toast.type === "error" ? "alert" : "text"}
            accessibilityLiveRegion="polite"
            style={[styles.toast, { backgroundColor: toast.type === "error" ? C.danger : C.navy }]}
          >
            {toast.type === "error" ? <AlertTriangle size={16} color="white" /> : <Check size={16} color="white" />}
            <AppText weight="medium" style={styles.text}>
              {toast.message}
            </AppText>
            <Pressable onPress={() => setToast(null)} accessibilityLabel="Dismiss" hitSlop={10}>
              <X size={14} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 380,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { flex: 1, color: "white", fontSize: 14 },
});
