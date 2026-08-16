-- Anonymous (no-account) link support.

-- AlterTable
ALTER TABLE "links" ADD COLUMN     "manageToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "links_manageToken_key" ON "links"("manageToken");

-- Seed the system "public" user that owns anonymously-created links.
-- The password hash is intentionally invalid so this account can never be
-- logged into; anonymous links are managed via per-link tokens instead.
INSERT INTO "users" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
VALUES ('public-user', 'public@linkmaker.local', 'Public', '!disabled-no-login!', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
