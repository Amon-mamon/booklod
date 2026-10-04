"use client";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { colors } from "@/config/brand";

interface ToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
  last?: boolean;
}

export function ToggleRow({ label, hint, checked, onChange, last }: ToggleRowProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3"
      style={{ borderBottom: last ? "none" : `1px solid ${colors.tan}` }}
    >
      <div className="min-w-0">
        <p className="text-sm" style={{ color: colors.navy }}>{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: colors.muted }}>{hint}</p>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
