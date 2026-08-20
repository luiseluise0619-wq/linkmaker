-- AlterTable: capture more measurable client/geo data
ALTER TABLE "link_events" ADD COLUMN     "city" TEXT,
ADD COLUMN     "cpuArch" TEXT,
ADD COLUMN     "deviceModel" TEXT,
ADD COLUMN     "deviceVendor" TEXT,
ADD COLUMN     "engine" TEXT,
ADD COLUMN     "osVersion" TEXT,
ADD COLUMN     "timezone" TEXT;
