// Prisma = 데이터베이스(PostgreSQL)에 접속해 쿼리를 보내는 도구(ORM).
// 이 파일은 앱 전체에서 공유하는 "하나의" DB 연결 객체(prisma)를 만든다.
import { PrismaClient } from "@prisma/client";

// [왜 globalThis에 저장할까?]
// 개발 모드에서 Next.js는 코드가 바뀔 때마다 파일을 다시 불러온다(hot reload).
// 그때마다 new PrismaClient()를 새로 만들면 DB 연결이 계속 쌓여 한도를 초과한다.
// 그래서 전역 객체(globalThis)에 한 번 만든 연결을 저장해 두고 재사용한다.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 이미 만들어 둔 연결이 있으면(?? 왼쪽) 그것을 쓰고,
// 없으면(?? 오른쪽) 새로 하나 만든다. log 옵션은 개발 중에만 경고까지 출력.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// 운영(production)에서는 재사용 문제가 없으므로 전역 저장은 개발/미리보기에서만 한다.
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
