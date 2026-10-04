/**
 * Brand design tokens.
 *
 * Kept as a typed constant because the UI applies them through inline styles.
 * Next step (optional): move these to Tailwind theme tokens / CSS variables so
 * components can use `text-navy` instead of `style={{ color: colors.navy }}`.
 */
export const colors = {
  navy: "#1B2A3A",
  green: "#5B8467",
  orange: "#E8672B",
  cream: "#F7F2E8",
  tan: "#E5DFD2",
  navyT: "#E4E8EB",
  greenT: "#E4EBE4",
  orangeT: "#FBE6D8",
  muted: "#8A8375",
  // Neutrals + feedback colours that were hard-coded across the original file
  subtle: "#9A958D",
  faint: "#B0AA9C",
  neutralTint: "#EDEAE3",
  danger: "#B23A3A",
  dangerTint: "#FDECEC",
  error: "#D64545",
  overlay: "rgba(27,42,58,0.45)",
} as const;

export type BrandColor = keyof typeof colors;
