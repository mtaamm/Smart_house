/*
  Warnings:

  - The primary key for the `control_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sensor_log` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `control_log` DROP PRIMARY KEY,
    MODIFY `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD PRIMARY KEY (`time`, `house_id`, `device_id`);

-- AlterTable
ALTER TABLE `device` MODIFY `init_time` DATETIME(3) NOT NULL,
    MODIFY `update_time` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `house` MODIFY `init_time` DATETIME(3) NOT NULL,
    MODIFY `update_time` DATETIME(3) NULL,
    MODIFY `verify_time` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `noti` MODIFY `time` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `sensor` MODIFY `init_time` DATETIME(3) NOT NULL,
    MODIFY `update_time` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `sensor_log` DROP PRIMARY KEY,
    MODIFY `time` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`time`, `sensor_id`, `house_id`);

-- AlterTable
ALTER TABLE `user` MODIFY `own_time` DATETIME(3) NULL,
    MODIFY `create_time` DATETIME(3) NOT NULL,
    MODIFY `update_time` DATETIME(3) NULL;
