/*
  Warnings:

  - Added the required column `name` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `room` ADD COLUMN `name` VARCHAR(50) NOT NULL;
