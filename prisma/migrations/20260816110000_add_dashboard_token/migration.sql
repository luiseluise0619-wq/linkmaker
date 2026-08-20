-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dashboardToken" TEXT,
ALTER COLUMN "isGuest" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "users_dashboardToken_key" ON "users"("dashboardToken");
