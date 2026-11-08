import type { ReactNode } from "react";
import { C } from "../theme";

interface SectionHeadingProps {
  children: ReactNode;
  action?: ReactNode;
}

export function SectionHeading({ children, action }: SectionHeadingProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold" style={{ color: C.navy }}>
        {children}
      </h3>
      {action}
    </div>
  );
}
