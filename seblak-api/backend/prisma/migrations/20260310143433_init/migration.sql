-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('customer', 'admin', 'kitchen_staff', 'driver', 'cashier') NOT NULL DEFAULT 'customer',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `fullAddress` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `addresses_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `menu_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `pricePerUnit` INTEGER NOT NULL,
    `unit` ENUM('PCS', 'GRAM', 'BUNCH') NOT NULL,
    `stockQuantity` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 10,
    `imageUrl` VARCHAR(191) NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `menu_items_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `assignedDriverId` VARCHAR(191) NULL,
    `orderType` ENUM('DINE_IN', 'TAKE_AWAY', 'DELIVERY') NOT NULL,
    `status` ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'PICKING', 'ON_DELIVERY', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `paymentStatus` ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` ENUM('CASH', 'QRIS', 'BANK_TRANSFER', 'ONLINE') NOT NULL,
    `levelPedas` ENUM('TIDAK_PEDAS', 'SEDANG', 'PEDAS') NOT NULL DEFAULT 'SEDANG',
    `kuahVarian` ENUM('NYEMEK', 'NORMAL', 'BANJIR') NOT NULL DEFAULT 'NORMAL',
    `telurType` ENUM('CEPLOK', 'ORAK_ARIK') NOT NULL DEFAULT 'CEPLOK',
    `rasaType` ENUM('ASIN', 'MANIS') NOT NULL DEFAULT 'ASIN',
    `subtotal` INTEGER NOT NULL DEFAULT 0,
    `deliveryFee` INTEGER NOT NULL DEFAULT 0,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL DEFAULT 0,
    `idempotencyKey` VARCHAR(191) NULL,
    `inventoryDecrementedAt` DATETIME(3) NULL,
    `changedByUserId` VARCHAR(191) NULL,
    `statusChangeReason` VARCHAR(191) NULL,
    `tableNumber` INTEGER NULL,
    `pickupTime` VARCHAR(191) NULL,
    `customerNameTakeaway` VARCHAR(191) NULL,
    `customerPhoneTakeaway` VARCHAR(191) NULL,
    `deliveryAddress` VARCHAR(191) NULL,
    `deliveryLatitude` DOUBLE NULL,
    `deliveryLongitude` DOUBLE NULL,
    `deliveryTime` DATETIME(3) NULL,
    `customerNameDelivery` VARCHAR(191) NULL,
    `customerPhoneDelivery` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `orders_idempotencyKey_key`(`idempotencyKey`),
    INDEX `orders_customerId_idx`(`customerId`),
    INDEX `orders_assignedDriverId_idx`(`assignedDriverId`),
    INDEX `orders_orderNumber_idx`(`orderNumber`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_levelPedas_idx`(`levelPedas`),
    INDEX `orders_telurType_idx`(`telurType`),
    INDEX `orders_rasaType_idx`(`rasaType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `menuItemId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit` ENUM('PCS', 'GRAM', 'BUNCH') NOT NULL,
    `pricePerUnit` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_menuItemId_idx`(`menuItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `paymentMethod` ENUM('CASH', 'QRIS', 'BANK_TRANSFER', 'ONLINE') NOT NULL,
    `gateway` ENUM('NONE', 'MIDTRANS', 'IPAYMU') NOT NULL DEFAULT 'NONE',
    `amount` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `notes` VARCHAR(191) NULL,
    `confirmedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_orderId_key`(`orderId`),
    INDEX `payments_orderId_idx`(`orderId`),
    INDEX `payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `gateway` ENUM('NONE', 'MIDTRANS', 'IPAYMU') NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL,
    `amount` INTEGER NOT NULL,
    `responseData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_transactions_paymentId_idx`(`paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drivers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `vehicleInfo` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'ON_DELIVERY', 'REST', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
    `currentLat` DOUBLE NULL,
    `currentLng` DOUBLE NULL,
    `rating` DOUBLE NOT NULL DEFAULT 5.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `drivers_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `previousStatus` ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'PICKING', 'ON_DELIVERY', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED') NULL,
    `newStatus` ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'PICKING', 'ON_DELIVERY', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED') NOT NULL,
    `changedBy` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_history_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_logs` (
    `id` VARCHAR(191) NOT NULL,
    `menuItemId` VARCHAR(191) NOT NULL,
    `action` ENUM('ORDER_CREATED', 'ORDER_COMPLETED', 'ORDER_CANCELLED', 'STOCK_IN', 'STOCK_OUT', 'MANUAL_ADJUSTMENT', 'LOW_STOCK_WARNING') NOT NULL,
    `quantityChange` INTEGER NOT NULL,
    `quantityBefore` INTEGER NOT NULL,
    `quantityAfter` INTEGER NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inventory_logs_menuItemId_idx`(`menuItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resourceType` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NULL,
    `changes` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_assignedDriverId_fkey` FOREIGN KEY (`assignedDriverId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_logs` ADD CONSTRAINT `inventory_logs_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `menu_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
