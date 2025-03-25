/*
  Warnings:

  - Added the required column `color` to the `device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `sensor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `device` ADD COLUMN `color` VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE `room` ADD COLUMN `color` VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE `sensor` ADD COLUMN `color` VARCHAR(6) NOT NULL;
