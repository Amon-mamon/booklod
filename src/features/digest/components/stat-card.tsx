import { colors } from "@/config/brand";

interface StatCardProps {
  number: number;
  label: string;
  color: string;
  tint: string;
  bordered?: boolean;
}

export function StatCard({ number, label, color, tint, bordered }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: tint, border: bordered ? `1px solid ${colors.tan}` : "none" }}
    >
      <p className="text-xs font-medium mb-1" style={{ color }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: colors.navy }}>{number}</p>
    </div>
  );
}
