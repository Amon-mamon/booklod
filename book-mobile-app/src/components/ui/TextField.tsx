import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { C, fonts, radius } from "@/theme";

interface TextFieldProps extends TextInputProps {
  invalid?: boolean;
}

export function TextField({ invalid, style, multiline, ...rest }: TextFieldProps) {
  return (
    <TextInput
      placeholderTextColor={C.faint}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      style={[styles.input, multiline && styles.multiline, invalid && { borderColor: "#D64545" }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.tan,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: C.navy,
  },
  multiline: { minHeight: 80 },
});
