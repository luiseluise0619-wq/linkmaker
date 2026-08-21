import "server-only";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { isValidSlug, randomSlug } from "./slug";
import { validateDestinationUrl } from "./url";
import type { CreateLinkInput, UpdateLinkInput } from "./validations";

/** System account that owns anonymously-created (no-login) links. */
export const PUBLIC_USER_ID = "public-user";

export class LinkError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function newManageToken(): string {
  return randomBytes(24).toString("base64url");
}

/** Ensure the system public user exists (created by migration; this is a
 * defensive fallback for environments where it may be missing). */
async function ensurePublicUser() {
  await prisma.user.upsert({
    where: { id: PUBLIC_USER_ID },
    update: {},
    create: {
      id: PUBLIC_USER_ID,
      email: "public@linkmaker.local",
      name: "Public",
      passwordHash: "!disabled-no-login!",
      // Must NOT be a guest: the retention cron prunes isGuest accounts, and
      // this system account owns every anonymous link. The seed migration
      // creates it with isGuest=false; keep this fallback consistent.
      isGuest: false,
    },
  });
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

// 로그인 사용자(작업공간)가 새 링크를 만든다.
export async function createLink(userId: string, input: CreateLinkInput) {
  // 1) 목적지 URL이 안전/유효한지 먼저 검사(안 되면 여기서 중단).
  const dest = validateDestinationUrl(input.destinationUrl);
  if (!dest.ok) throw new LinkError(dest.error, 422);

  // 2) 슬러그 결정: 사용자가 직접 정했으면 검사 후 중복 확인, 아니면 랜덤 생성.
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

  // 3) 캠페인을 지정했다면, 그 캠페인이 정말 이 사용자 소유인지 확인(남의 것 방지).
  if (input.campaignId) await ensureCampaignOwned(userId, input.campaignId);

  // 4) 만료일이 있으면 과거가 아닌지 확인.
  let expiresAt: Date | null = null;
  if (input.expiresAt) {
    expiresAt = new Date(input.expiresAt);
    if (expiresAt.getTime() <= Date.now()) {
      throw new LinkError("Expiration date must be in the future.", 422);
    }
  }

  // 5) DB에 링크를 저장.
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
    // P2002 = "고유(unique) 제약 위반". 거의 동시에 같은 슬러그가 만들어진 경우 등.
    // (앞에서 중복 검사를 했어도, 검사와 저장 사이의 짧은 틈에 끼어들 수 있어 여기서도 대비.)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new LinkError("That slug is already taken.", 409);
    }
    throw e;
  }
}

export interface CreatePublicLinkInput {
  destinationUrl: string;
  slug?: string;
}

/**
 * 계정 없이(익명으로) 링크를 만든다. 이 링크는 시스템 계정(public-user)이 소유하고,
 * 로그인 세션 대신 추측 불가능한 manageToken으로 관리한다.
 * (랜딩 페이지에서 누구나 링크를 줄일 때 이 경로를 쓴다.)
 */
export async function createPublicLink(input: CreatePublicLinkInput) {
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

  await ensurePublicUser();
  const manageToken = newManageToken();

  try {
    const link = await prisma.link.create({
      data: {
        userId: PUBLIC_USER_ID,
        slug,
        destinationUrl: dest.url,
        manageToken,
      },
      select: { id: true, slug: true, destinationUrl: true, manageToken: true },
    });
    return link;
  } catch (e) {
    // P2002 = "고유(unique) 제약 위반". 거의 동시에 같은 슬러그가 만들어진 경우 등.
    // (앞에서 중복 검사를 했어도, 검사와 저장 사이의 짧은 틈에 끼어들 수 있어 여기서도 대비.)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new LinkError("That slug is already taken.", 409);
    }
    throw e;
  }
}

/** 익명 링크의 관리/통계 화면을 위해 링크를 가져온다. 반드시 올바른 token이 있어야 함. */
export async function getPublicLinkByToken(slug: string, token: string) {
  if (!token) return null;
  const link = await prisma.link.findUnique({
    where: { slug },
    include: { image: true },
  });
  // 토큰이 없거나 일치하지 않으면 남의 링크이므로 보여주지 않는다(null).
  if (!link || !link.manageToken || link.manageToken !== token) return null;
  return link;
}

// [권한 확인의 핵심 패턴]
// where: { id, userId } → "이 id를 가지면서 동시에 내 것인" 링크만 찾는다.
// 남의 링크 id를 넣어도 userId가 안 맞으면 null이 되어 접근이 막힌다(IDOR 방지).
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

// 링크를 수정한다. 슬러그(주소)나 목적지를 바꿔도 링크의 id는 그대로이므로,
// 기존에 쌓인 클릭 통계는 사라지지 않고 그대로 이어진다(이 서비스의 핵심 장점).
export async function updateLink(
  userId: string,
  id: string,
  input: UpdateLinkInput,
) {
  // 먼저 "내 소유"인지 확인. 내 것이 아니면 수정 불가.
  const link = await prisma.link.findFirst({ where: { id, userId } });
  if (!link) throw new LinkError("Link not found.", 404);

  // data에는 "실제로 바뀐 항목만" 담는다(input에서 값이 온 것만).
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
    // P2002 = "고유(unique) 제약 위반". 거의 동시에 같은 슬러그가 만들어진 경우 등.
    // (앞에서 중복 검사를 했어도, 검사와 저장 사이의 짧은 틈에 끼어들 수 있어 여기서도 대비.)
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new LinkError("That slug is already taken.", 409);
    }
    throw e;
  }
}

// 링크를 삭제한다(내 소유일 때만). 링크에 연결된 이미지/클릭 이벤트는 DB 설정
// (onDelete: Cascade)에 따라 함께 지워진다.
export async function deleteLink(userId: string, id: string) {
  const link = await prisma.link.findFirst({
    where: { id, userId },
    include: { image: true },
  });
  if (!link) throw new LinkError("Link not found.", 404);
  await prisma.link.delete({ where: { id } });
  return link;
}
