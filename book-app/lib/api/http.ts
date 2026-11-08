import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "payload_too_large"
  | "rate_limited"
  | "upstream_error"
  | "server_misconfigured"
  | "internal_error";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  payload_too_large: 413,
  rate_limited: 429,
  upstream_error: 502,
  server_misconfigured: 500,
  internal_error: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

// Bearer tokens (not cookies) authenticate the API, so a wildcard origin is
// safe. Set API_CORS_ORIGIN to lock it down to one origin if you prefer.
function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": process.env.API_CORS_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders() });
}

export function noContent() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return json({ error: { code: error.code, message: error.message } }, error.status);
  }
  console.error("[api] unexpected error", error);
  return json(
    { error: { code: "internal_error", message: "Something went wrong. Please try again." } },
    500,
  );
}

/** Wraps a route handler so every thrown error becomes a consistent JSON error. */
export function handler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      return errorResponse(error);
    }
  };
}

export function options() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

const MAX_BODY_BYTES = 2 * 1024 * 1024;

/**
 * Reads a JSON body with a hard byte cap. The Content-Length header is only a
 * fast path: chunked requests have none, so the stream itself is counted and
 * reading stops as soon as the cap is passed.
 */
export async function readJson(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  const tooLarge = () => new ApiError("payload_too_large", "Request body is too large.");
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw tooLarge();

  let text = "";
  if (request.body) {
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw tooLarge();
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("bad_request", "Request body must be valid JSON.");
  }
}

/** Maps a Supabase/PostgREST error into an ApiError without leaking internals. */
export function fromDatabaseError(error: { code?: string; message?: string }, fallback: string): ApiError {
  if (error.code === "42501") return new ApiError("forbidden", "You are not allowed to do that.");
  if (error.code === "22023") return new ApiError("bad_request", error.message || fallback);
  if (error.code === "23503") return new ApiError("conflict", "That record is still in use.");
  if (error.code === "23505") return new ApiError("conflict", "That already exists.");
  if (error.code === "23514") return new ApiError("bad_request", "That value is not allowed.");
  console.error("[api] database error", error);
  return new ApiError("internal_error", fallback);
}
