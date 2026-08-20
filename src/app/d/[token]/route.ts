import { NextRequest, NextResponse } from "next/server";
import { startSessionByToken } from "@/lib/auth";
import { appUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Portable dashboard link. Visiting /d/<token> verifies the workspace token,
 * starts a session cookie for it, and opens the dashboard — so a workspace can
 * be reopened on any device with no login.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  const ok = await startSessionByToken(params.token);
  const url = new URL(ok ? "/dashboard" : "/link-unavailable?reason=notfound", appUrl());
  return NextResponse.redirect(url, 302);
}
