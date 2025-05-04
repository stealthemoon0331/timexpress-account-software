/*
  Warnings:

  - You are about to drop the column `paypalSubscriptionId` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Payment_paypalSubscriptionId_key` ON `payment`;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `paypalSubscriptionId`;

-- CreateIndex
CREATE UNIQUE INDEX `User_paypalSubscriptionId_key` ON `User`(`paypalSubscriptionId`);
