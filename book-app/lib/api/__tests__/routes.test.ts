import { beforeEach, describe, expect, it, vi } from "vitest";

// Minimal in-memory stand-in for the Supabase client used by the API.
const state = vi.hoisted(() => ({
  user: { id: "user-1", email: "reader@example.com", user_metadata: {}, app_metadata: { provider: "email" } } as unknown,
  validToken: "good-token",
  library: { books: [] as unknown[], revision: 0 },
  profile: null as unknown,
  plan: { id: "starter", name: "Starter", canShare: false, bookLimit: null } as Record<string, unknown>,
  isAdmin: false,
  rpcCalls: [] as { name: string; args: unknown }[],
  rateLimitResult: { data: 0, error: null } as { data: number | null; error: unknown },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token: string) =>
        token === state.validToken
          ? { data: { user: state.user }, error: null }
          : { data: { user: null }, error: { message: "invalid" } },
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () =>
            table === "libraries"
              ? { data: state.library, error: null }
              : { data: state.profile ? { data: state.profile } : null, error: null },
        }),
      }),
      upsert: async (row: { data: unknown }) => {
        state.profile = row.data;
        return { error: null };
      },
    }),
    rpc: async (name: string, args: { p_expected_revision: number; p_books: unknown[]; p_plan_id?: string }) => {
      state.rpcCalls.push({ name, args });
      if (name === "rate_limit_hit") return state.rateLimitResult;
      if (name === "my_plan") return { data: state.plan, error: null };
      if (name === "is_admin") return { data: state.isAdmin, error: null };
      if (name === "set_my_plan") {
        if (args.p_plan_id !== "plus" && args.p_plan_id !== "starter") {
          return { data: null, error: { code: "42501", message: "That plan cannot be chosen from the app" } };
        }
        state.plan = { id: args.p_plan_id, name: args.p_plan_id, canShare: args.p_plan_id === "plus", bookLimit: null };
        return { data: state.plan, error: null };
      }
      if (name === "publish_my_shelf") {
        return state.plan.canShare
          ? { data: "A".repeat(32), error: null }
          : { data: null, error: { code: "42501", message: "Plus only" } };
      }
      if (args.p_expected_revision !== state.library.revision) return { data: null, error: null };
      state.library = { books: args.p_books, revision: state.library.revision + 1 };
      return { data: state.library.revision, error: null };
    },
  }),
}));

import { GET as getLibrary } from "../../../app/api/v1/library/route";
import { POST as addBook } from "../../../app/api/v1/library/books/route";
import { DELETE as deleteBook, PUT as putBook } from "../../../app/api/v1/library/books/[id]/route";
import { GET as getMe, PATCH as patchMe } from "../../../app/api/v1/me/route";
import { POST as share } from "../../../app/api/v1/share/route";
import { GET as adminUsers } from "../../../app/api/v1/admin/users/route";
import { resetRateLimits } from "../rate-limit";

function req(path: string, init: RequestInit = {}, token = state.validToken) {
  return new Request(`http://localhost${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  state.library = { books: [], revision: 0 };
  state.profile = null;
  state.plan = { id: "starter", name: "Starter", canShare: false, bookLimit: null };
  state.isAdmin = false;
  state.rpcCalls = [];
  state.rateLimitResult = { data: 0, error: null };
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  resetRateLimits();
});

describe("API routes", () => {
  it("rejects missing or invalid tokens with 401", async () => {
    const res = await getLibrary(new Request("http://localhost/api/v1/library"));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");
    expect((await getLibrary(req("/api/v1/library", {}, "bad"))).status).toBe(401);
  });

  it("creates the default profile on first GET /me", async () => {
    const res = await getMe(req("/api/v1/me"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.profile).toMatchObject({ name: "reader", plan: "starter", provider: "Email", avatarInitial: "R" });
    expect(state.profile).not.toBeNull();
  });

  it("refuses library writes when the service key is missing", async () => {
    const res = await addBook(req("/api/v1/library/books", { method: "POST", body: JSON.stringify({ book: { title: "Dune" } }) }));
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("server_misconfigured");
    expect(state.library.revision).toBe(0);
  });

  it("uses the shared rate limit when configured, and memory if the database call fails", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
    const patch = () => patchMe(req("/api/v1/me", { method: "PATCH", body: JSON.stringify({ name: "Ana" }) }));

    state.rateLimitResult = { data: 12, error: null };
    const limited = await patch();
    expect(limited.status).toBe(429);
    expect((await limited.json()).error.message).toMatch(/12 seconds/);

    state.rateLimitResult = { data: null, error: { message: "down" } };
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect((await patch()).status).toBe(200);
    expect(errorLog).toHaveBeenCalled();
    errorLog.mockRestore();
  });

  it("supports the full book lifecycle", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
    const created = await addBook(req("/api/v1/library/books", { method: "POST", body: JSON.stringify({ book: { title: "Dune" } }) }));
    expect(created.status).toBe(201);
    const { book } = await created.json();
    expect(book.id).toMatch(/^b_/);

    const updated = await putBook(
      req(`/api/v1/library/books/${book.id}`, { method: "PUT", body: JSON.stringify({ book: { title: "Dune", readingStatus: "reading" } }) }),
      ctx(book.id),
    );
    expect((await updated.json()).book.readingStatus).toBe("reading");

    const list = await (await getLibrary(req("/api/v1/library"))).json();
    expect(list).toMatchObject({ revision: 2, books: [{ id: book.id }] });

    const removed = await deleteBook(req(`/api/v1/library/books/${book.id}`, { method: "DELETE" }), ctx(book.id));
    expect(await removed.json()).toEqual({ revision: 3 });
    expect((await deleteBook(req(`/api/v1/library/books/${book.id}`, { method: "DELETE" }), ctx(book.id))).status).toBe(404);
  });

  it("returns 400 for invalid input", async () => {
    const res = await addBook(req("/api/v1/library/books", { method: "POST", body: "{not json" }));
    expect(res.status).toBe(400);
    const missingTitle = await addBook(req("/api/v1/library/books", { method: "POST", body: JSON.stringify({ book: {} }) }));
    expect((await missingTitle.json()).error.message).toMatch(/title/);
  });

  it("changes plan only through set_my_plan and never stores plan in profiles.data", async () => {
    const res = await patchMe(req("/api/v1/me", { method: "PATCH", body: JSON.stringify({ plan: "plus", name: "Ana" }) }));
    expect(res.status).toBe(200);
    const { profile } = await res.json();
    expect(profile).toMatchObject({ plan: "plus", canShare: true, name: "Ana" });
    expect(state.rpcCalls.map((c) => c.name)).toContain("set_my_plan");
    expect(state.profile).not.toHaveProperty("plan");
    expect(state.profile).not.toHaveProperty("canShare");
  });

  it("rejects a plan the database refuses (e.g. not self-service)", async () => {
    const res = await patchMe(req("/api/v1/me", { method: "PATCH", body: JSON.stringify({ plan: "lifetime" }) }));
    expect(res.status).toBe(403);
    expect(state.plan.id).toBe("starter");
  });

  it("ignores a plan written straight into profiles.data", async () => {
    state.profile = { name: "Sneaky", plan: "plus" };
    const { profile } = await (await getMe(req("/api/v1/me"))).json();
    expect(profile.plan).toBe("starter");
    expect(profile.canShare).toBe(false);
  });

  it("refuses to publish a shelf on a plan without sharing", async () => {
    const res = await share(req("/api/v1/share", { method: "POST" }));
    expect(res.status).toBe(403);
    expect((await res.json()).error.message).toMatch(/Plus/);
  });

  it("reports isAdmin on GET /me", async () => {
    state.isAdmin = true;
    expect((await (await getMe(req("/api/v1/me"))).json()).isAdmin).toBe(true);
  });

  it("returns 403 from the admin API for non-admins, and 500 when the service key is missing", async () => {
    expect((await adminUsers(req("/api/v1/admin/users"))).status).toBe(403);
    expect((await adminUsers(req("/api/v1/admin/users", {}, "bad"))).status).toBe(401);
    state.isAdmin = true;
    const res = await adminUsers(req("/api/v1/admin/users"));
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("server_misconfigured");
  });

  it("rate-limits writes per user", async () => {
    let last = 0;
    for (let i = 0; i < 62; i++) {
      last = (await patchMe(req("/api/v1/me", { method: "PATCH", body: JSON.stringify({ name: `n${i}` }) }))).status;
    }
    expect(last).toBe(429);
  });
});
