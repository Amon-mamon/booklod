// Same palette as the web app (book-app/app/components/theme.ts).
export const C = {
  navy: "#1B2A3A",
  green: "#5B8467",
  orange: "#E8672B",
  cream: "#F7F2E8",
  tan: "#E5DFD2",
  navyT: "#E4E8EB",
  greenT: "#E4EBE4",
  orangeT: "#FBE6D8",
  muted: "#8A8375",
  subtle: "#9A958D",
  faint: "#B0AA9C",
  white: "#FFFFFF",
  danger: "#B23A3A",
  dangerT: "#FDECEC",
  warning: "#B7791F",
  backdrop: "rgba(27,42,58,0.45)",
} as const;

export const fonts = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

export type FontWeight = keyof typeof fonts;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const space = (n: number) => n * 4;
