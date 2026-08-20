-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_waiterId_fkey`;

-- DropIndex
DROP INDEX `Order_waiterId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` MODIFY `waiterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_waiterId_fkey` FOREIGN KEY (`waiterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
