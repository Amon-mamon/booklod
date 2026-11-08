import { handler, json, options } from "../../../../lib/api/http";

export const OPTIONS = options;

/** GET /api/v1/health — unauthenticated liveness check. */
export const GET = handler(async () => json({ status: "ok", version: "v1" }));
