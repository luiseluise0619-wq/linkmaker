import { NextRequest } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import {
  deleteLink,
  getOwnedLink,
  updateLink,
  LinkError,
} from "@/lib/links";
import { deleteImage } from "@/lib/storage";
import { updateLinkSchema } from "@/lib/validations";
import {
  handleZodError,
  jsonError,
  jsonNotFound,
  jsonOk,
  jsonUnauthorized,
} from "@/lib/api";
import { shortUrl } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();
  const link = await getOwnedLink(user.id, params.id);
  if (!link) return jsonNotFound("Link");
  return jsonOk({ ...link, shortUrl: shortUrl(link.slug) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }
  const parsed = updateLinkSchema.safeParse(body);
  if (!parsed.success) return handleZodError(parsed.error as z.ZodError);

  try {
    const link = await updateLink(user.id, params.id, parsed.data);
    return jsonOk({ ...link, shortUrl: shortUrl(link.slug) });
  } catch (e) {
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    return jsonError("Could not update the link.", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await requireDbUser();
  if (!user) return jsonUnauthorized();
  try {
    const link = await deleteLink(user.id, params.id);
    if (link.image?.url) await deleteImage(link.image.url);
    return jsonOk({ id: params.id });
  } catch (e) {
    if (e instanceof LinkError) return jsonError(e.message, e.status);
    return jsonError("Could not delete the link.", 500);
  }
}
