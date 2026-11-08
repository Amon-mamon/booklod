import type { ReactNode } from "react";
import { C } from "../theme";

interface FieldLabelProps {
  children: ReactNode;
  optional?: boolean;
}

export function FieldLabel({ children, optional = false }: FieldLabelProps) {
  return (
    <label className="mb-1 block text-sm font-medium" style={{ color: C.navy }}>
      {children}
      {optional && (
        <span className="ml-1 text-xs font-normal" style={{ color: "#9A958D" }}>
          (optional)
        </span>
      )}
    </label>
  );
}
