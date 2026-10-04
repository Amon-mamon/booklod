import { NextResponse } from "next/server";
import { isValidShareCode } from "@/features/sharing/lib/share-code";
import { parseSharePayload } from "@/features/sharing/lib/snapshot";
import { shelfStore } from "@/server/shelf-store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ code: string }> };

/**
 * Shared-shelf API.
 * TODO(auth): PUT/DELETE are unauthenticated — anyone who knows a code can
 * overwrite or remove that shelf. Tie writes to the signed-in owner once real
 * auth exists.
 */
async function resolveCode(ctx: RouteContext): Promise<string | null> {
  const { code } = await ctx.params;
  const normalized = code.toUpperCase();
  return isValidShareCode(normalized) ? normalized : null;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const code = await resolveCode(ctx);
  if (!code) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const snapshot = await shelfStore.get(code);
  return snapshot
    ? NextResponse.json(snapshot)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, ctx: RouteContext) {
  const code = await resolveCode(ctx);
  if (!code) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const payload = parseSharePayload(body);
  if (!payload) return NextResponse.json({ error: "Invalid shelf" }, { status: 422 });

  await shelfStore.set(code, { ...payload, updatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const code = await resolveCode(ctx);
  if (!code) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await shelfStore.delete(code);
  return new NextResponse(null, { status: 204 });
}
