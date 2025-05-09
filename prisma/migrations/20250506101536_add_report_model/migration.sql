/*
  Warnings:

  - You are about to drop the column `userId` on the `report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `Report_userId_fkey`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `report`;

-- AlterTable
ALTER TABLE `report` DROP COLUMN `userId`;
