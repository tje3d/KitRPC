-- CreateTable
CREATE TABLE `WalletAddress` (
    `id` VARCHAR(191) NOT NULL,
    `network` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WalletAddress_network_idx`(`network`),
    INDEX `WalletAddress_address_idx`(`address`),
    INDEX `WalletAddress_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
