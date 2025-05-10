/*
  Warnings:

  - You are about to drop the `usersystem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `usersystem` DROP FOREIGN KEY `UserSystem_systemId_fkey`;

-- DropForeignKey
ALTER TABLE `usersystem` DROP FOREIGN KEY `UserSystem_userId_fkey`;

-- AlterTable
ALTER TABLE `plan` ADD COLUMN `systems` JSON NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `systems` JSON NULL;

-- DropTable
DROP TABLE `usersystem`;
