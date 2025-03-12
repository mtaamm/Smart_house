-- CreateTable
CREATE TABLE `control_log` (
    `time` DATETIME(0) NOT NULL,
    `device_id` INTEGER NOT NULL,
    `house_id` CHAR(36) NOT NULL,
    `action` VARCHAR(45) NOT NULL,

    INDEX `fk_control_log_device1_idx`(`device_id`, `house_id`),
    PRIMARY KEY (`time`, `house_id`, `device_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device` (
    `device_id` INTEGER NOT NULL AUTO_INCREMENT,
    `house_id` CHAR(36) NOT NULL,
    `floor_id` INTEGER NOT NULL,
    `room_id` INTEGER NULL,
    `x` FLOAT NULL,
    `y` FLOAT NULL,
    `name` VARCHAR(45) NOT NULL,
    `type` VARCHAR(45) NOT NULL,
    `init_time` DATETIME(0) NOT NULL,
    `update_time` DATETIME(0) NULL,
    `status` VARCHAR(45) NOT NULL,

    INDEX `fk_device_floor1_idx`(`floor_id`, `house_id`),
    INDEX `fk_device_house1_idx`(`house_id`),
    INDEX `fk_device_room1_idx`(`room_id`, `floor_id`, `house_id`),
    PRIMARY KEY (`device_id`, `house_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `floor` (
    `floor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `house_id` CHAR(36) NOT NULL,

    INDEX `fk_floor_house1_idx`(`house_id`),
    PRIMARY KEY (`floor_id`, `house_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `house` (
    `house_id` CHAR(36) NOT NULL,
    `length` FLOAT NOT NULL,
    `width` FLOAT NOT NULL,
    `init_time` DATETIME(0) NOT NULL,
    `update_time` DATETIME(0) NULL,

    PRIMARY KEY (`house_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `noti` (
    `noti_id` CHAR(36) NOT NULL,
    `uid` CHAR(36) NOT NULL,
    `time` DATETIME(0) NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `read` BIT(1) NOT NULL,

    INDEX `fk_noti_user_idx`(`uid`),
    PRIMARY KEY (`noti_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room` (
    `room_id` INTEGER NOT NULL AUTO_INCREMENT,
    `floor_id` INTEGER NOT NULL,
    `house_id` CHAR(36) NOT NULL,
    `length` FLOAT NOT NULL,
    `width` FLOAT NOT NULL,
    `x` FLOAT NOT NULL,
    `y` FLOAT NOT NULL,

    INDEX `fk_room_floor1_idx`(`floor_id`, `house_id`),
    PRIMARY KEY (`room_id`, `floor_id`, `house_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensor` (
    `sensor_id` INTEGER NOT NULL AUTO_INCREMENT,
    `house_id` CHAR(36) NOT NULL,
    `floor_id` INTEGER NOT NULL,
    `room_id` INTEGER NULL,
    `x` FLOAT NULL,
    `y` FLOAT NULL,
    `name` VARCHAR(45) NOT NULL,
    `type` VARCHAR(45) NOT NULL,
    `init_time` DATETIME(0) NOT NULL,
    `update_time` DATETIME(0) NULL,

    INDEX `fk_sensor_floor1_idx`(`floor_id`, `house_id`),
    INDEX `fk_sensor_house1_idx`(`house_id`),
    INDEX `fk_sensor_room1_idx`(`room_id`, `floor_id`, `house_id`),
    PRIMARY KEY (`sensor_id`, `house_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sensor_log` (
    `time` DATETIME(0) NOT NULL,
    `sensor_id` INTEGER NOT NULL,
    `house_id` CHAR(36) NOT NULL,
    `value` VARCHAR(500) NOT NULL,

    INDEX `fk_sensor_log_sensor1_idx`(`sensor_id`, `house_id`),
    PRIMARY KEY (`time`, `sensor_id`, `house_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `uid` CHAR(36) NOT NULL,
    `username` VARCHAR(45) NOT NULL,
    `password` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `phone` VARCHAR(12) NULL,
    `name` VARCHAR(45) NULL,
    `age` INTEGER NULL,
    `house_id` CHAR(36) NULL,
    `root_owner` BIT(1) NULL,
    `own_time` DATETIME(0) NULL,
    `create_time` DATETIME(0) NOT NULL,
    `update_time` DATETIME(0) NULL,

    INDEX `fk_user_house1_idx`(`house_id`),
    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `control_log` ADD CONSTRAINT `fk_control_log_device1` FOREIGN KEY (`device_id`, `house_id`) REFERENCES `device`(`device_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `fk_device_floor1` FOREIGN KEY (`floor_id`, `house_id`) REFERENCES `floor`(`floor_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `fk_device_house1` FOREIGN KEY (`house_id`) REFERENCES `house`(`house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `fk_device_room1` FOREIGN KEY (`room_id`, `floor_id`, `house_id`) REFERENCES `room`(`room_id`, `floor_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `floor` ADD CONSTRAINT `fk_floor_house1` FOREIGN KEY (`house_id`) REFERENCES `house`(`house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `noti` ADD CONSTRAINT `fk_noti_user` FOREIGN KEY (`uid`) REFERENCES `user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room` ADD CONSTRAINT `fk_room_floor1` FOREIGN KEY (`floor_id`, `house_id`) REFERENCES `floor`(`floor_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor` ADD CONSTRAINT `fk_sensor_floor1` FOREIGN KEY (`floor_id`, `house_id`) REFERENCES `floor`(`floor_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor` ADD CONSTRAINT `fk_sensor_house1` FOREIGN KEY (`house_id`) REFERENCES `house`(`house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor` ADD CONSTRAINT `fk_sensor_room1` FOREIGN KEY (`room_id`, `floor_id`, `house_id`) REFERENCES `room`(`room_id`, `floor_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sensor_log` ADD CONSTRAINT `fk_sensor_log_sensor1` FOREIGN KEY (`sensor_id`, `house_id`) REFERENCES `sensor`(`sensor_id`, `house_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `fk_user_house1` FOREIGN KEY (`house_id`) REFERENCES `house`(`house_id`) ON DELETE SET NULL ON UPDATE CASCADE;
