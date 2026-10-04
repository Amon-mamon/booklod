import type { LucideIcon } from "lucide-react";
import { colors } from "@/config/brand";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed py-10 px-6 text-center" style={{ borderColor: colors.tan }}>
      <div
        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
        style={{ background: colors.cream }}
      >
        <Icon size={20} style={{ color: colors.green }} />
      </div>
      <p className="text-sm font-medium" style={{ color: colors.navy }}>{title}</p>
      {subtitle && <p className="text-xs mt-1" style={{ color: colors.subtle }}>{subtitle}</p>}
    </div>
  );
}
