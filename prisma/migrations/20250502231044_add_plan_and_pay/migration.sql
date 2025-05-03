/*
  Warnings:

  - You are about to alter the column `features` on the `plan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `plan` MODIFY `features` JSON NOT NULL;
