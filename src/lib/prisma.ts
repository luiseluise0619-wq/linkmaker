import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Touch the database with a trivial query to wake an auto-suspended (free-tier)
 * instance. Best-effort and non-fatal — used to warm the DB when a visitor
 * enters the site so the next action is fast.
 */
export async function warmDb(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // ignore — warming is best-effort
  }
}
