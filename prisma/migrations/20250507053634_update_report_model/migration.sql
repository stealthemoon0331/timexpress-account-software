-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `Report_userId_fkey`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `report`;
