"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./links";

/**
 * Reset all analytics for the current workspace: deletes every click event for
 * the workspace's links. The links themselves are kept — only the numbers are
 * cleared back to zero.
 */
export async function resetMetricsAction(): Promise<ActionResult> {
  const user = await requireUser();
  const result = await prisma.linkEvent.deleteMany({
    where: { link: { userId: user.id } },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/links");
  return { ok: true, data: { deleted: result.count } };
}

/**
 * Start a fresh workspace: clears the current session so the next created link
 * provisions a new, empty workspace. Existing links stay reachable via their
 * saved dashboard link.
 */
export async function newWorkspaceAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
