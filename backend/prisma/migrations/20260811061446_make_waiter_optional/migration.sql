-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_waiterId_fkey`;

-- DropIndex
DROP INDEX `Order_waiterId_fkey` ON `Order`;

-- AlterTable
ALTER TABLE `Order` MODIFY `waiterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_waiterId_fkey` FOREIGN KEY (`waiterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;