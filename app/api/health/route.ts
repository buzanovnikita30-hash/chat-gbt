import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Liveness for nginx/uptime monitors. No Supabase, no auth. */
export function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
