import { getSupabaseClient } from "../../lib/supabase/client";

/** Calls this app's /api/v1 with the signed-in user's access token. */
export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await getSupabaseClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status}).`);
  return body as T;
}
