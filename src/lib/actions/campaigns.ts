"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCampaignSchema } from "@/lib/validations";
import type { ActionResult } from "./links";

export async function createCampaignAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createCampaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message };
  }
  try {
    await prisma.campaign.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });
    revalidatePath("/dashboard/campaigns");
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "You already have a campaign with that name." };
    }
    return { ok: false, error: "Could not create the campaign." };
  }
}

export async function deleteCampaignAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/dashboard/campaigns");
  return { ok: true };
}
