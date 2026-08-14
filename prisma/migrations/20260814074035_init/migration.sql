-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ClickSource" AS ENUM ('LINK', 'QR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "slug" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_images" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sizeBytes" INTEGER,
    "contentType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_events" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "referrer" TEXT,
    "referrerDomain" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "isMobile" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "country" TEXT,
    "region" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "source" "ClickSource" NOT NULL DEFAULT 'LINK',
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "botReason" TEXT,
    "visitorHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "campaigns_userId_idx" ON "campaigns"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_userId_name_key" ON "campaigns"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "links_slug_key" ON "links"("slug");

-- CreateIndex
CREATE INDEX "links_userId_idx" ON "links"("userId");

-- CreateIndex
CREATE INDEX "links_slug_idx" ON "links"("slug");

-- CreateIndex
CREATE INDEX "links_userId_status_idx" ON "links"("userId", "status");

-- CreateIndex
CREATE INDEX "links_campaignId_idx" ON "links"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "link_images_linkId_key" ON "link_images"("linkId");

-- CreateIndex
CREATE INDEX "link_events_linkId_idx" ON "link_events"("linkId");

-- CreateIndex
CREATE INDEX "link_events_timestamp_idx" ON "link_events"("timestamp");

-- CreateIndex
CREATE INDEX "link_events_linkId_timestamp_idx" ON "link_events"("linkId", "timestamp");

-- CreateIndex
CREATE INDEX "link_events_country_idx" ON "link_events"("country");

-- CreateIndex
CREATE INDEX "link_events_deviceType_idx" ON "link_events"("deviceType");

-- CreateIndex
CREATE INDEX "link_events_referrerDomain_idx" ON "link_events"("referrerDomain");

-- CreateIndex
CREATE INDEX "link_events_linkId_isBot_idx" ON "link_events"("linkId", "isBot");

-- CreateIndex
CREATE INDEX "link_events_visitorHash_idx" ON "link_events"("visitorHash");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_images" ADD CONSTRAINT "link_images_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_events" ADD CONSTRAINT "link_events_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
