/** Tiny className joiner (swap for `clsx` if you add it later). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
