import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/Sheet";
import { C, radius } from "@/theme";
import { fmtDate, fromISODate, toISODate } from "@/utils/dates";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** YYYY-MM-DD date input using the native picker. */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => fromISODate(value));

  function openPicker() {
    setDraft(fromISODate(value));
    setOpen(true);
  }

  return (
    <View style={{ flex: 1 }}>
      <FieldLabel optional>{label}</FieldLabel>
      <Pressable onPress={openPicker} accessibilityRole="button" accessibilityLabel={`${label}: ${value ? fmtDate(value) : "not set"}`} style={styles.field}>
        <AppText color={value ? C.navy : C.faint} style={{ flex: 1 }} numberOfLines={1}>
          {value ? fmtDate(value) : "Select date"}
        </AppText>
        <Calendar size={15} color={C.muted} />
      </Pressable>
      {value ? (
        <Pressable onPress={() => onChange("")} hitSlop={6}>
          <AppText size={11} color={C.muted} style={{ marginTop: 4 }}>
            Clear
          </AppText>
        </Pressable>
      ) : null}

      {open && Platform.OS === "android" ? (
        <DateTimePicker
          value={draft}
          mode="date"
          onValueChange={(_event, date) => {
            setOpen(false);
            onChange(toISODate(date));
          }}
          onDismiss={() => setOpen(false)}
        />
      ) : null}

      {Platform.OS !== "android" ? (
        <Sheet visible={open} onClose={() => setOpen(false)}>
          <AppText weight="semibold" size={16} style={{ marginBottom: 8 }}>
            {label}
          </AppText>
          <DateTimePicker value={draft} mode="date" display="inline" accentColor={C.green} onValueChange={(_e, date) => setDraft(date)} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Button label="Cancel" variant="outline" onPress={() => setOpen(false)} style={{ flex: 1 }} />
            <Button
              label="Done"
              variant="green"
              onPress={() => {
                onChange(toISODate(draft));
                setOpen(false);
              }}
              style={{ flex: 1 }}
            />
          </View>
        </Sheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.tan,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});
