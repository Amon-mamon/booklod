import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { ApiError } from "./http";
import { RATE_LIMITS, rateLimit } from "./rate-limit";
import { createServiceClient, isServiceRoleConfigured } from "./service-client";

export interface AuthContext {
  user: User;
  /** Supabase client acting as the signed-in user, so RLS policies still apply. */
  supabase: SupabaseClient;
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new ApiError(
      "server_misconfigured",
      "Supabase is not configured on the server. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}

const serverAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const;

/** Anonymous client for public endpoints (e.g. viewing a shared shelf). */
export function createAnonClient(): SupabaseClient {
  const { url, anonKey } = supabaseConfig();
  return createClient(url, anonKey, { auth: serverAuthOptions });
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

/**
 * Verifies the Supabase access token sent by the client and returns a client
 * scoped to that user. Clients sign in with Supabase Auth directly (web or
 * mobile) and send `Authorization: Bearer <access_token>` to the API.
 */
export async function requireUser(request: Request): Promise<AuthContext> {
  const token = readBearerToken(request);
  if (!token) {
    throw new ApiError("unauthorized", "Missing Authorization: Bearer <access token> header.");
  }

  const { url, anonKey } = supabaseConfig();
  const supabase = createClient(url, anonKey, {
    auth: serverAuthOptions,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError("unauthorized", "Your session has expired. Please sign in again.");
  }

  return { user: data.user, supabase };
}

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** requireUser plus the per-user write limit for state-changing methods. */
export async function requireUserForWrite(request: Request): Promise<AuthContext> {
  const ctx = await requireUser(request);
  if (WRITE_METHODS.has(request.method.toUpperCase())) await rateLimit(RATE_LIMITS.write, ctx.user.id);
  return ctx;
}

export { createServiceClient, isServiceRoleConfigured };

export interface AdminContext extends AuthContext {
  /** Service-role client. Every query must be scoped by hand: RLS does not apply. */
  admin: SupabaseClient;
}

/** Verifies the token, then checks public.admins via is_admin(). 403 otherwise. */
export async function requireAdmin(request: Request): Promise<AdminContext> {
  const ctx = await requireUser(request);
  await rateLimit(RATE_LIMITS.admin, ctx.user.id);
  const { data, error } = await ctx.supabase.rpc("is_admin");
  if (error) {
    console.error("[api] is_admin failed", error);
    throw new ApiError("internal_error", "Unable to check admin access.");
  }
  if (data !== true) throw new ApiError("forbidden", "Admins only.");
  return { ...ctx, admin: createServiceClient() };
}

/** Same check without throwing, for GET /me. */
export async function checkIsAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}
