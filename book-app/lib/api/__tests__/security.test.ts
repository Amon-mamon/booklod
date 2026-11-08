import { beforeEach, describe, expect, it } from "vitest";
import {
  parseAdminUserCreate,
  parseAdminUserPatch,
  parsePlanInput,
  parseSettingsPatch,
  parseUserId,
  parseUserListQuery,
} from "../admin-validation";
import { ApiError, readJson } from "../http";
import { RATE_LIMITS, rateLimit, resetRateLimits } from "../rate-limit";
import { generateBookId, parseBook, parseProfilePatch } from "../validation";

function chunkedRequest(chunks: Uint8Array[]): Request {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
  // No Content-Length header: this is the case the old header-only check missed.
  return new Request("http://localhost/x", { method: "POST", body, duplex: "half" } as RequestInit);
}

async function apiErrorOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected an ApiError");
}

describe("readJson body cap", () => {
  it("rejects a chunked body without Content-Length once it passes the cap", async () => {
    const chunk = new Uint8Array(512 * 1024).fill(32); // spaces
    const error = await apiErrorOf(readJson(chunkedRequest([chunk, chunk, chunk, chunk, chunk])));
    expect(error.status).toBe(413);
  });

  it("rejects a declared Content-Length over the cap without reading", async () => {
    const request = new Request("http://localhost/x", {
      method: "POST",
      body: "{}",
      headers: { "content-length": String(3 * 1024 * 1024) },
    });
    expect((await apiErrorOf(readJson(request))).status).toBe(413);
  });

  it("parses a normal chunked JSON body", async () => {
    const enc = new TextEncoder();
    expect(await readJson(chunkedRequest([enc.encode('{"a":'), enc.encode("1}")]))).toEqual({ a: 1 });
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/x", { method: "POST", body: "{nope" });
    expect((await apiErrorOf(readJson(request))).status).toBe(400);
  });
});

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit, then returns 429 until the window resets", async () => {
    const rule = { name: "t", limit: 3, windowMs: 1000 };
    for (let i = 0; i < 3; i++) await rateLimit(rule, "u1", 0);
    await expect(rateLimit(rule, "u1", 10)).rejects.toThrow(/Too many requests/);
    await expect(rateLimit(rule, "u2", 10)).resolves.toBeUndefined();
    await expect(rateLimit(rule, "u1", 1001)).resolves.toBeUndefined();
  });

  it("has a limit on the Open Library proxy", () => {
    expect(RATE_LIMITS.lookup.limit).toBeGreaterThan(0);
  });
});

describe("plan cannot be smuggled through the profile", () => {
  it("accepts only a plan id; the database decides whether it is allowed", () => {
    expect(parseProfilePatch({ plan: "plus" })).toEqual({ plan: "plus" });
    expect(() => parseProfilePatch({ plan: "plus'; drop table" })).toThrow(/plan/);
    expect(() => parseProfilePatch({ plan: 1 })).toThrow(/plan/);
  });
});

describe("image URLs", () => {
  it("allows data URLs and Open Library / Google hosts only", () => {
    expect(parseBook({ title: "A", coverUrl: "https://covers.openlibrary.org/b/id/1-L.jpg" }, "b").coverUrl).toBeTruthy();
    expect(parseProfilePatch({ photoUrl: "https://lh3.googleusercontent.com/a/x" }).photoUrl).toBeTruthy();
    expect(() => parseBook({ title: "A", coverUrl: "https://tracker.example.com/p.gif" }, "b")).toThrow(/coverUrl/);
    expect(() => parseBook({ title: "A", coverUrl: "https://covers.openlibrary.org.evil.com/x.jpg" }, "b")).toThrow();
    expect(() => parseBook({ title: "A", coverUrl: "https://user:pw@covers.openlibrary.org/x" }, "b")).toThrow();
    expect(() => parseBook({ title: "A", coverUrl: "data:image/svg+xml;base64,PHN2Zz4=" }, "b")).toThrow();
  });
});

describe("generateBookId", () => {
  it("uses crypto randomness and fits the id pattern", () => {
    const ids = new Set(Array.from({ length: 200 }, generateBookId));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(id).toMatch(/^b_[a-f0-9]{32}$/);
  });
});

describe("admin validation", () => {
  it("parses a plan price change", () => {
    expect(parsePlanInput({ priceCents: 12900 }, "update")).toEqual({ price_cents: 12900 });
    expect(parsePlanInput({ bookLimit: null }, "update")).toEqual({ book_limit: null });
    expect(() => parsePlanInput({}, "update")).toThrow(/Nothing to update/);
    expect(() => parsePlanInput({ priceCents: -1 }, "update")).toThrow(/priceCents/);
    expect(() => parsePlanInput({ priceCents: 1.5 }, "update")).toThrow(/priceCents/);
    expect(() => parsePlanInput({ billingInterval: "week" }, "update")).toThrow(/billingInterval/);
  });

  it("requires id and name to create a plan", () => {
    expect(() => parsePlanInput({ name: "X" }, "create")).toThrow(/id/);
    expect(() => parsePlanInput({ id: "gold" }, "create")).toThrow(/name/);
    expect(() => parsePlanInput({ id: "Gold!", name: "X" }, "create")).toThrow(/Plan ids/);
    expect(parsePlanInput({ id: "gold", name: "Gold", features: [" a "] }, "create")).toEqual({
      id: "gold",
      name: "Gold",
      features: ["a"],
    });
  });

  it("parses subscription edits", () => {
    const patch = parseAdminUserPatch({
      subscription: { planId: "plus", status: "active", currentPeriodEnd: "2027-11-07", note: "comp" },
    });
    expect(patch.subscription).toMatchObject({ planId: "plus", status: "active", note: "comp" });
    expect(patch.subscription?.currentPeriodEnd).toMatch(/^2027-11-07T/);
    expect(parseAdminUserPatch({ subscription: { currentPeriodEnd: null } }).subscription).toEqual({ currentPeriodEnd: null });
    expect(() => parseAdminUserPatch({ subscription: { status: "free" } })).toThrow(/status/);
    expect(() => parseAdminUserPatch({ role: "admin" })).toThrow(/Nothing to update/);
  });

  it("validates new users", () => {
    expect(parseAdminUserCreate({ email: " A@B.co ", password: "" })).toEqual({ email: "a@b.co" });
    expect(() => parseAdminUserCreate({ email: "nope" })).toThrow(/email/);
    expect(() => parseAdminUserCreate({ email: "a@b.co", password: "short" })).toThrow(/password/);
  });

  it("rejects unknown settings and bad ids", () => {
    expect(parseSettingsPatch({ announcement_enabled: true })).toEqual({ announcement_enabled: true });
    expect(() => parseSettingsPatch({ service_role_key: "x" })).toThrow(/Unknown setting/);
    expect(() => parseSettingsPatch({ support_email: "not-an-email" })).toThrow(/support_email/);
    expect(() => parseUserId("../etc")).toThrow(/user id/);
  });

  it("escapes LIKE wildcards in user search", () => {
    expect(parseUserListQuery(new URLSearchParams("search=100%_off")).search).toBe("100\\%\\_off");
    expect(() => parseUserListQuery(new URLSearchParams("limit=5000"))).toThrow(/limit/);
  });
});
