// src/routes/menu.js
import express from 'express';
import menuController from '../controllers/menuController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * ===== PUBLIC ROUTES =====
 */

// GET /api/v1/menu/categories
router.get('/categories', menuController.getAllCategories);

// GET /api/v1/menu/categories/:id
router.get('/categories/:id', menuController.getCategoryById);

// GET /api/v1/menu/items
router.get('/items', menuController.getAllMenuItems);

// GET /api/v1/menu/items/:id
router.get('/items/:id', menuController.getMenuItemById);

/**
 * ===== ADMIN ROUTES =====
 */

// POST /api/v1/admin/menu/categories
router.post('/admin/categories', authenticate, authorize('admin'), menuController.createCategory);

// PATCH /api/v1/admin/menu/categories/:id
router.patch('/admin/categories/:id', authenticate, authorize('admin'), menuController.updateCategory);

// DELETE /api/v1/admin/menu/categories/:id
router.delete('/admin/categories/:id', authenticate, authorize('admin'), menuController.deleteCategory);

// POST /api/v1/admin/menu/items
router.post('/admin/items', authenticate, authorize('admin'), menuController.createMenuItem);

// PATCH /api/v1/admin/menu/items/:id
router.patch('/admin/items/:id', authenticate, authorize('admin'), menuController.updateMenuItem);

// DELETE /api/v1/admin/menu/items/:id
router.delete('/admin/items/:id', authenticate, authorize('admin'), menuController.deleteMenuItem);

// PATCH /api/v1/admin/menu/items/:id/stock
router.patch('/admin/items/:id/stock', authenticate, authorize('admin'), menuController.updateStock);

// GET /api/v1/admin/menu/low-stock
router.get('/admin/low-stock', authenticate, authorize('admin'), menuController.getLowStockItems);

export default router;