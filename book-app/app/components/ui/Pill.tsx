import type { HTMLAttributes } from "react";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  color: string;
  textColor?: string;
}

export function Pill({ children, color, textColor = "#fff", style, ...rest }: PillProps) {
  return (
    <span
      style={{ background: color, color: textColor, ...style }}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
      {...rest}
    >
      {children}
    </span>
  );
}
