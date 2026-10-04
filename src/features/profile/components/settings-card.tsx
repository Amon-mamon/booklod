import type { ReactNode } from "react";
import { colors } from "@/config/brand";

/** White rounded container used for each settings group. */
export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${colors.tan}` }}>
      {children}
    </div>
  );
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-1" style={{ color: colors.muted }}>
      {children}
    </p>
  );
}
