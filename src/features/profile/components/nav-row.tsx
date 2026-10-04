import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { colors } from "@/config/brand";

interface NavRowProps {
  label: string;
  icon?: LucideIcon;
  /** Navigates when provided; otherwise renders a button using `onClick`. */
  href?: string;
  onClick?: () => void;
  last?: boolean;
  danger?: boolean;
}

export function NavRow({ icon: Icon, label, href, onClick, last, danger }: NavRowProps) {
  const className = "w-full flex items-center justify-between px-4 py-3 text-left";
  const style = { borderBottom: last ? "none" : `1px solid ${colors.tan}` };

  const content = (
    <>
      <span className="text-sm flex items-center gap-2" style={{ color: danger ? colors.danger : colors.navy }}>
        {Icon && <Icon size={15} style={{ color: danger ? colors.danger : colors.muted }} />}
        {label}
      </span>
      <ChevronRight size={14} style={{ color: danger ? "#D9A0A0" : colors.muted }} />
    </>
  );

  return href ? (
    <Link href={href} className={className} style={style}>{content}</Link>
  ) : (
    <button type="button" onClick={onClick} className={className} style={style}>{content}</button>
  );
}
