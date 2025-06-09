/*
  Warnings:

  - You are about to drop the column `adminId` on the `tenants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Tenants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Tenants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tenants` DROP FOREIGN KEY `Tenants_adminId_fkey`;

-- DropIndex
DROP INDEX `Tenants_adminId_key` ON `tenants`;

-- AlterTable
ALTER TABLE `tenants` DROP COLUMN `adminId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Tenants_email_key` ON `Tenants`(`email`);

-- AddForeignKey
ALTER TABLE `Tenants` ADD CONSTRAINT `Tenants_email_fkey` FOREIGN KEY (`email`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
