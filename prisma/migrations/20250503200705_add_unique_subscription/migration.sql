/*
  Warnings:

  - You are about to drop the column `paypalPlanId` on the `plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `plan` DROP COLUMN `paypalPlanId`,
    ADD COLUMN `paypalSubscriptionId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Plan_paypalSubscriptionId_key` ON `Plan`(`paypalSubscriptionId`);
