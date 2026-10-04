// 32 symbols (no ambiguous 0/O/1/I) — 32 divides 256, so `byte & 31` is unbiased.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SHARE_CODE_LENGTH = 6;
export const SHARE_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

/** Share codes act as access tokens, so use a CSPRNG rather than Math.random. */
export function generateShareCode(): string {
  const bytes = new Uint8Array(SHARE_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b & 31]).join("");
}

export function isValidShareCode(code: string): boolean {
  return SHARE_CODE_PATTERN.test(code);
}
