import { colors } from "@/config/brand";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 80 72" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="18" height="52" rx="4" fill="#000000" />
      <rect x="9" y="16" width="8" height="3" rx="1.5" fill={colors.cream} />
      <rect x="29" y="14" width="18" height="44" rx="4" fill={colors.green} />
      <rect x="32" y="22" width="8" height="3" rx="1.5" fill={colors.cream} />
      <rect x="49" y="8" width="18" height="50" rx="4" fill={colors.orange} transform="rotate(8 58 33)" />
      <rect x="52" y="18" width="8" height="3" rx="1.5" fill={colors.cream} transform="rotate(8 58 33)" />
      <rect x="4" y="62" width="72" height="5" rx="2.5" fill="#000000" />
    </svg>
  );
}
