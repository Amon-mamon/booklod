import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./http";

export function isServiceRoleConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/**
 * Service-role client: bypasses RLS. Server only. Never expose
 * SUPABASE_SERVICE_ROLE_KEY to a browser or the mobile app (no NEXT_PUBLIC_).
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new ApiError(
      "server_misconfigured",
      "Admin features and library saving need SUPABASE_SERVICE_ROLE_KEY set on the server.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
