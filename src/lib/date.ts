export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Formats a `YYYY-MM-DD` string for display. Returns the input if unparseable. */
export function formatDate(d: string | undefined | null): string {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
