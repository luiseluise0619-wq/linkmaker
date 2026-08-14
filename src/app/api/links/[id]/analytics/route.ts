import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { getOwnedLink } from "@/lib/links";
import { getLinkAnalytics } from "@/lib/stats";
import { jsonNotFound, jsonOk, jsonUnauthorized } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();
  const link = await getOwnedLink(user.id, params.id);
  if (!link) return jsonNotFound("Link");
  const analytics = await getLinkAnalytics(link.id);
  return jsonOk({ linkId: link.id, ...analytics });
}
