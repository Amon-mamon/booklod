const mockStore = new Map<string, string>();
const mockLegacy = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 0,
  getItemAsync: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    if (!/^[A-Za-z0-9._-]+$/.test(k)) throw new Error(`invalid key ${k}`);
    if (v.length > 2048) throw new Error("value too large");
    mockStore.set(k, v);
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    mockStore.delete(k);
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (k: string) => mockLegacy.get(k) ?? null),
  removeItem: jest.fn(async (k: string) => {
    mockLegacy.delete(k);
  }),
}));

// eslint-disable-next-line import/first -- must load after jest.mock
import { secureStorage } from "../secure-storage";

beforeEach(() => {
  mockStore.clear();
  mockLegacy.clear();
});

describe("secureStorage", () => {
  it("round-trips a session larger than SecureStore's 2KB value limit", async () => {
    const session = JSON.stringify({ access_token: "a".repeat(3000), refresh_token: "r".repeat(500) });
    await secureStorage.setItem("sb-abc-auth-token", session);
    expect(await secureStorage.getItem("sb-abc-auth-token")).toBe(session);
    expect(mockStore.get("sb-abc-auth-token")).toBe("2");
  });

  it("removes stale chunks when the value shrinks, and everything on remove", async () => {
    await secureStorage.setItem("k", "x".repeat(5000));
    await secureStorage.setItem("k", "short");
    expect(await secureStorage.getItem("k")).toBe("short");
    expect([...mockStore.keys()].sort()).toEqual(["k", "k.0"]);
    await secureStorage.removeItem("k");
    expect(mockStore.size).toBe(0);
  });

  it("sanitises keys SecureStore would reject", async () => {
    await secureStorage.setItem("sb:auth/token", "v");
    expect(await secureStorage.getItem("sb:auth/token")).toBe("v");
  });

  it("moves a legacy AsyncStorage session into SecureStore once", async () => {
    mockLegacy.set("sb-abc-auth-token", "old-session");
    expect(await secureStorage.getItem("sb-abc-auth-token")).toBe("old-session");
    expect(mockLegacy.has("sb-abc-auth-token")).toBe(false);
    expect(await secureStorage.getItem("sb-abc-auth-token")).toBe("old-session");
  });

  it("treats a partial write as signed out", async () => {
    mockStore.set("k", "3");
    mockStore.set("k.0", "a");
    expect(await secureStorage.getItem("k")).toBeNull();
  });
});
