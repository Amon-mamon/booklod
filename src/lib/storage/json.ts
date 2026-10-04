import { storage } from "./storage";

/** Reads and parses a JSON value. Returns `null` when missing or corrupt. */
export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await storage.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Serialises and stores a value. Returns `false` instead of throwing. */
export async function writeJson(key: string, value: unknown): Promise<boolean> {
  try {
    await storage.set(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage write failed", key, error);
    return false;
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await storage.remove(key);
  } catch {
    /* key may not exist — fine */
  }
}
