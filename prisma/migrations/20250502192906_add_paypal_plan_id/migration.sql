-- AlterTable
ALTER TABLE `payment` ADD COLUMN `paypalSubscriptionId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `paypalSubscriptionId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PayPalWebhook` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `payload` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PayPalWebhook_eventId_key`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
