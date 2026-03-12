/*
  Warnings:

  - You are about to drop the `driverrating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `activity_logs` DROP FOREIGN KEY `activity_logs_userId_fkey`;

-- DropForeignKey
ALTER TABLE `addresses` DROP FOREIGN KEY `addresses_userId_fkey`;

-- DropForeignKey
ALTER TABLE `driverrating` DROP FOREIGN KEY `DriverRating_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `driverrating` DROP FOREIGN KEY `DriverRating_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_logs` DROP FOREIGN KEY `inventory_logs_menuItemId_fkey`;

-- DropForeignKey
ALTER TABLE `menu_items` DROP FOREIGN KEY `menu_items_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_menuItemId_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `order_status_history` DROP FOREIGN KEY `order_status_history_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_assignedDriverId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_transactions` DROP FOREIGN KEY `payment_transactions_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_orderId_fkey`;

-- DropTable
DROP TABLE `driverrating`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('customer', 'admin', 'kitchen_staff', 'driver', 'cashier') NOT NULL DEFAULT 'customer',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `driverStatus` VARCHAR(191) NULL DEFAULT 'offline',
    `currentLat` DOUBLE NOT NULL DEFAULT 0,
    `currentLng` DOUBLE NOT NULL DEFAULT 0,
    `vehicleType` VARCHAR(191) NULL,
    `vehicleLicense` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_vehicleLicense_key`(`vehicleLicense`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `driver_ratings` (
    `id` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `driver_ratings_driverId_idx`(`driverId`),
    INDEX `driver_ratings_customerId_idx`(`customerId`),
    UNIQUE INDEX `driver_ratings_driverId_customerId_key`(`driverId`, `customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
