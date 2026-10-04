/** Rounds `n` up to a "nice" axis maximum (4, 6, 8, 10, 20, 50, …). */
export function niceMax(n: number): number {
  if (n <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / pow;
  let step: number;
  if (norm <= 2) step = 2;
  else if (norm <= 5) step = 5;
  else step = 10;
  return Math.ceil(n / (step * pow)) * step * pow;
}

export function buildAxis(rawMax: number): { top: number; ticks: number[] } {
  const top = niceMax(rawMax);
  const tickCount = Math.min(5, top);
  const step = top / tickCount;
  return { top, ticks: Array.from({ length: tickCount + 1 }, (_, i) => Math.round(step * i)) };
}
