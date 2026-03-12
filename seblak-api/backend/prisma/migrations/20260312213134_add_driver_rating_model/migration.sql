/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(13))` to `VarChar(191)`.

*/
-- DropIndex
DROP INDEX `driver_ratings_customerId_idx` ON `driver_ratings`;

-- DropIndex
DROP INDEX `driver_ratings_driverId_idx` ON `driver_ratings`;

-- DropIndex
DROP INDEX `users_email_idx` ON `users`;

-- DropIndex
DROP INDEX `users_role_idx` ON `users`;

-- AlterTable
ALTER TABLE `driver_ratings` MODIFY `comment` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'customer';
