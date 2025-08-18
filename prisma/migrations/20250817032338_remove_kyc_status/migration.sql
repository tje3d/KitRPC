/*
  هشدارها:

  - شما در حال حذف ستون `status` از جدول `KycVerification` هستید. تمام داده‌های این ستون از بین خواهند رفت.

*/
-- DropIndex
DROP INDEX `KycVerification_status_idx` ON `KycVerification`;

-- AlterTable
ALTER TABLE `KycVerification` DROP COLUMN `status`;
