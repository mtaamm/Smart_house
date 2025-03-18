-- AlterTable
ALTER TABLE `house` ADD COLUMN `verify_code` INTEGER NULL,
    ADD COLUMN `verify_time` DATETIME(0) NULL;
