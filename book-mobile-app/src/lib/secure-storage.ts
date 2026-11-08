import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * Supabase auth storage backed by the iOS Keychain / Android Keystore.
 *
 * SecureStore values are limited to ~2KB, and a Supabase session (access +
 * refresh token + user) is larger, so values are split into chunks:
 *   <key>        -> number of chunks
 *   <key>.<i>    -> chunk i
 */
const CHUNK_SIZE = 1800;
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

// SecureStore keys may only contain letters, digits, ".", "-" and "_".
const safeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, "_");

async function chunkCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(key, OPTIONS);
  const count = raw === null ? 0 : Number(raw);
  return Number.isInteger(count) && count > 0 && count < 1000 ? count : 0;
}

async function removeChunks(key: string, from: number, to: number) {
  for (let i = from; i < to; i++) await SecureStore.deleteItemAsync(`${key}.${i}`, OPTIONS);
}

/**
 * Older builds kept the session in AsyncStorage (unencrypted). Move it into
 * SecureStore once and delete the plain-text copy, so nobody is signed out.
 */
async function migrateFromAsyncStorage(name: string): Promise<string | null> {
  let legacy: string | null;
  try {
    legacy = await AsyncStorage.getItem(name);
    if (legacy === null) return null;
    await secureStorage.setItem(name, legacy);
  } catch {
    return null;
  }
  await AsyncStorage.removeItem(name).catch(() => undefined);
  return legacy;
}

export const secureStorage = {
  async getItem(name: string): Promise<string | null> {
    const key = safeKey(name);
    const count = await chunkCount(key);
    if (count === 0) return migrateFromAsyncStorage(name);
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`, OPTIONS);
      if (part === null) return null; // partial write: treat as signed out
      parts.push(part);
    }
    return parts.join("");
  },

  async setItem(name: string, value: string): Promise<void> {
    const key = safeKey(name);
    const previous = await chunkCount(key);
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) chunks.push(value.slice(i, i + CHUNK_SIZE));
    for (let i = 0; i < chunks.length; i++) await SecureStore.setItemAsync(`${key}.${i}`, chunks[i], OPTIONS);
    await SecureStore.setItemAsync(key, String(chunks.length), OPTIONS);
    if (previous > chunks.length) await removeChunks(key, chunks.length, previous);
  },

  async removeItem(name: string): Promise<void> {
    const key = safeKey(name);
    const count = await chunkCount(key);
    await SecureStore.deleteItemAsync(key, OPTIONS);
    await removeChunks(key, 0, count);
    // Never let an old plaintext session come back after sign-out.
    await AsyncStorage.removeItem(name).catch(() => undefined);
  },
};
