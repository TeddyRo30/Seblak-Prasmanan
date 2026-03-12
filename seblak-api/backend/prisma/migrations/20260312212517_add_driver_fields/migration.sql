-- DropIndex
DROP INDEX `users_vehicleLicense_key` ON `users`;

-- AlterTable
ALTER TABLE `users` MODIFY `currentLat` DOUBLE NULL DEFAULT 0,
    MODIFY `currentLng` DOUBLE NULL DEFAULT 0;
