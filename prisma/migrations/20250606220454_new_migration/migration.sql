/*
  Warnings:

  - A unique constraint covering the columns `[tenantId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `cardBrand` VARCHAR(191) NULL,
    ADD COLUMN `cardLast4` VARCHAR(191) NULL,
    ADD COLUMN `tenantId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_tenantId_key` ON `User`(`tenantId`);
