/*
  Warnings:

  - You are about to drop the column `paypalSubscriptionId` on the `plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Plan_paypalSubscriptionId_key` ON `plan`;

-- AlterTable
ALTER TABLE `plan` DROP COLUMN `paypalSubscriptionId`,
    ADD COLUMN `paypalPlanId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_paypalSubscriptionId_key` ON `Payment`(`paypalSubscriptionId`);
