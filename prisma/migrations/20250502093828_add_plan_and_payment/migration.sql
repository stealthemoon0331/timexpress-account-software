/*
  Warnings:

  - You are about to drop the column `duration` on the `plan` table. All the data in the column will be lost.
  - Added the required column `features` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `plan` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Plan_name_key` ON `plan`;

-- AlterTable
ALTER TABLE `plan` DROP COLUMN `duration`,
    ADD COLUMN `features` TEXT NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL;
