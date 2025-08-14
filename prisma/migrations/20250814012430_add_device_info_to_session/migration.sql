-- AlterTable
ALTER TABLE `Session` ADD COLUMN `browser` VARCHAR(191) NULL,
    ADD COLUMN `deviceType` VARCHAR(191) NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Session_userAgent_idx` ON `Session`(`userAgent`);

-- CreateIndex
CREATE INDEX `Session_ipAddress_idx` ON `Session`(`ipAddress`);

-- CreateIndex
CREATE INDEX `Session_deviceType_idx` ON `Session`(`deviceType`);

-- CreateIndex
CREATE INDEX `Session_browser_idx` ON `Session`(`browser`);
