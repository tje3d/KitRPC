/*
  هشدارها:

  - شما در حال حذف ستون `rejectedAt` از جدول `KycVerification` هستید. تمام داده‌های این ستون از بین خواهند رفت.
  - شما در حال حذف ستون `rejectionReason` از جدول `KycVerification` هستید. تمام داده‌های این ستون از بین خواهند رفت.

*/
-- AlterTable
ALTER TABLE `KycVerification` DROP COLUMN `rejectedAt`,
    DROP COLUMN `rejectionReason`;
