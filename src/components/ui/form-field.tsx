import type { CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { colors } from "@/config/brand";
import { cn } from "@/lib/cn";

export function FieldLabel({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium mb-1" style={{ color: colors.navy }}>
      {children}
      {optional && (
        <span className="font-normal text-xs ml-1" style={{ color: colors.subtle }}>(optional)</span>
      )}
    </label>
  );
}

const baseClass = "w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2";

function fieldStyle(invalid?: boolean, extra?: CSSProperties): CSSProperties {
  return {
    borderColor: invalid ? colors.error : colors.tan,
    color: colors.navy,
    // Tailwind ring colour custom property
    ["--tw-ring-color" as string]: colors.green,
    ...extra,
  };
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextInput({ invalid, className, style, ...props }: TextInputProps) {
  return <input className={cn(baseClass, className)} style={fieldStyle(invalid, style)} {...props} />;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid, className, style, ...props }: TextAreaProps) {
  return <textarea className={cn(baseClass, className)} style={fieldStyle(invalid, style)} {...props} />;
}
