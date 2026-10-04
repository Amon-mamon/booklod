import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color: string;
  textColor?: string;
  style?: CSSProperties;
}

export function Pill({ children, color, textColor = "#fff", style, ...rest }: PillProps) {
  return (
    <span
      style={{ background: color, color: textColor, ...style }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      {...rest}
    >
      {children}
    </span>
  );
}
