-- AlterTable
ALTER TABLE `Transaction` MODIFY `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'CAPACITY') NOT NULL;

-- CreateTable
CREATE TABLE `SystemCapacity` (
    `id` VARCHAR(191) NOT NULL,
    `currency` ENUM('IRT', 'USDT') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SystemCapacity_currency_idx`(`currency`),
    UNIQUE INDEX `SystemCapacity_currency_key`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
