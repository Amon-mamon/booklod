import { env } from "@/config/env";
import { supabase } from "@/lib/supabase";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiRequestError(401, "unauthorized", "Please sign in again.");
  return token;
}

/** Thin fetch wrapper for the Booklod API (book-app/app/api/v1). */
export async function apiRequest<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, query } = options;
  const url = new URL(`${env.apiUrl}/api/v1${path}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${await accessToken()}`;

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(0, "network_error", "Can't reach Booklod. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: { code?: string; message?: string } })
    | null;

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      payload?.error?.code || "http_error",
      payload?.error?.message || `Request failed (${response.status}).`,
    );
  }
  if (payload === null) {
    throw new ApiRequestError(response.status, "invalid_response", "Booklod sent an unexpected response. Please try again.");
  }
  return payload as T;
}

export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
