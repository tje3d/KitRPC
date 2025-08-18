/*
  هشدارها:

  - شما در حال حذف ستون `completedAt` از جدول `KycVerification` هستید. تمام داده‌های این ستون از بین خواهند رفت.
  - شما در حال حذف ستون `submittedAt` از جدول `KycVerification` هستید. تمام داده‌های این ستون از بین خواهند رفت.

*/
-- AlterTable
ALTER TABLE `KycVerification` DROP COLUMN `completedAt`,
    DROP COLUMN `submittedAt`;
