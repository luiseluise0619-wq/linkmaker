import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { isValidSlug, randomSlug } from "./slug";
import { validateDestinationUrl } from "./url";
import type { CreateLinkInput, UpdateLinkInput } from "./validations";

export class LinkError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

async function ensureCampaignOwned(userId: string, campaignId: string) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId },
    select: { id: true },
  });
  if (!campaign) throw new LinkError("Campaign not found.", 404);
}

async function generateUniqueSlug(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const slug = randomSlug();
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new LinkError("Could not generate a unique slug. Try again.", 500);
}

export async function createLink(userId: string, input: CreateLinkInput) {
  const dest = validateDestinationUrl(input.destinationUrl);
  if (!dest.ok) throw new LinkError(dest.error, 422);

  let slug: string;
  if (input.slug) {
    if (!isValidSlug(input.slug)) {
      throw new LinkError("That slug is invalid or reserved.", 422);
    }
    const existing = await prisma.link.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (existing) throw new LinkError("That slug is already taken.", 409);
    slug = input.slug;
  } else {
    slug = await generateUniqueSlug();
  }

  if (input.campaignId) await ensureCampaignOwned(userId, input.campaignId);

  let expiresAt: Date | null = null;
  if (input.expiresAt) {
    expiresAt = new Date(input.expiresAt);
    if (expiresAt.getTime() <= Date.now()) {
      throw new LinkError("Expiration date must be in the future.", 422);
    }
  }

  try {
    return await prisma.link.create({
      data: {
        userId,
        slug,
        destinationUrl: dest.url,
        title: input.title ?? null,
        description: input.description ?? null,
        campaignId: input.campaignId ?? null,
        expiresAt,
        utmSource: input.utmSource ?? null,
        utmMedium: input.utmMedium ?? null,
        utmCampaign: input.utmCampaign ?? null,
        utmTerm: input.utmTerm ?? null,
        utmContent: input.utmContent ?? null,
      },
      include: { image: true },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new LinkError("That slug is already taken.", 409);
    }
    throw e;
  }
}

export async function getOwnedLink(userId: string, id: string) {
  const link = await prisma.link.findFirst({
    where: { id, userId },
    include: { image: true, campaign: true },
  });
  return link;
}

export async function getOwnedLinkBySlug(userId: string, slug: string) {
  return prisma.link.findFirst({
    where: { slug, userId },
    include: { image: true, campaign: true },
  });
}

export async function updateLink(
  userId: string,
  id: string,
  input: UpdateLinkInput,
) {
  const link = await prisma.link.findFirst({ where: { id, userId } });
  if (!link) throw new LinkError("Link not found.", 404);

  const data: Prisma.LinkUpdateInput = {};

  if (input.destinationUrl !== undefined) {
    const dest = validateDestinationUrl(input.destinationUrl);
    if (!dest.ok) throw new LinkError(dest.error, 422);
    data.destinationUrl = dest.url;
  }

  if (input.slug !== undefined && input.slug !== link.slug) {
    if (!isValidSlug(input.slug)) {
      throw new LinkError("That slug is invalid or reserved.", 422);
    }
    const existing = await prisma.link.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (existing) throw new LinkError("That slug is already taken.", 409);
    data.slug = input.slug;
  }

  if (input.title !== undefined) data.title = input.title ?? null;
  if (input.description !== undefined)
    data.description = input.description ?? null;
  if (input.status !== undefined) data.status = input.status;

  if (input.campaignId !== undefined) {
    if (input.campaignId) {
      await ensureCampaignOwned(userId, input.campaignId);
      data.campaign = { connect: { id: input.campaignId } };
    } else {
      data.campaign = { disconnect: true };
    }
  }

  if (input.expiresAt !== undefined) {
    if (input.expiresAt === null) {
      data.expiresAt = null;
    } else {
      const expiresAt = new Date(input.expiresAt);
      if (expiresAt.getTime() <= Date.now()) {
        throw new LinkError("Expiration date must be in the future.", 422);
      }
      data.expiresAt = expiresAt;
    }
  }

  for (const key of [
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmTerm",
    "utmContent",
  ] as const) {
    if (input[key] !== undefined) data[key] = input[key] ?? null;
  }

  try {
    return await prisma.link.update({
      where: { id },
      data,
      include: { image: true, campaign: true },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new LinkError("That slug is already taken.", 409);
    }
    throw e;
  }
}

export async function deleteLink(userId: string, id: string) {
  const link = await prisma.link.findFirst({
    where: { id, userId },
    include: { image: true },
  });
  if (!link) throw new LinkError("Link not found.", 404);
  await prisma.link.delete({ where: { id } });
  return link;
}
