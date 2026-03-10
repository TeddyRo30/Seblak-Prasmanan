// src/controllers/menuController.js
import menuService from '../services/menuService.js';

/**
 * ===== CATEGORY ENDPOINTS =====
 */

/**
 * GET /api/v1/menu/categories
 * Get all categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await menuService.getAllCategories({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Categories retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/menu/categories/:id
 * Get category by ID with items
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await menuService.getCategoryById(id);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Category retrieved successfully',
      data: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/menu/categories
 * Create new category (Admin only)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await menuService.createCategory({
      name,
      description
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Category created successfully',
      data: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/menu/categories/:id
 * Update category (Admin only)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, displayOrder } = req.body;

    const category = await menuService.updateCategory(id, {
      name,
      description,
      displayOrder
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Category updated successfully',
      data: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/menu/categories/:id
 * Delete category (Admin only)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await menuService.deleteCategory(id);

    res.status(200).json({
      success: true,
      status: 200,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ===== MENU ITEM ENDPOINTS =====
 */

/**
 * GET /api/v1/menu/items
 * Get all menu items with filters
 */
const getAllMenuItems = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, categoryId, search } = req.query;

    const result = await menuService.getAllMenuItems({
      limit: parseInt(limit),
      offset: parseInt(offset),
      categoryId,
      search,
      onlyAvailable: true
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Menu items retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/menu/items/:id
 * Get menu item by ID
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await menuService.getMenuItemById(id);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Menu item retrieved successfully',
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/menu/items
 * Create new menu item (Admin only)
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { categoryId, name, description, pricePerUnit, unit, stockQuantity, lowStockThreshold, imageUrl } = req.body;

    const item = await menuService.createMenuItem({
      categoryId,
      name,
      description,
      pricePerUnit,
      unit,
      stockQuantity,
      lowStockThreshold,
      imageUrl
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Menu item created successfully',
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/menu/items/:id
 * Update menu item (Admin only)
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, pricePerUnit, stockQuantity, lowStockThreshold, imageUrl, isAvailable, displayOrder } = req.body;

    const item = await menuService.updateMenuItem(id, {
      name,
      description,
      pricePerUnit,
      stockQuantity,
      lowStockThreshold,
      imageUrl,
      isAvailable,
      displayOrder
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Menu item updated successfully',
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/menu/items/:id
 * Delete menu item (Admin only)
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await menuService.deleteMenuItem(id);

    res.status(200).json({
      success: true,
      status: 200,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/menu/items/:id/stock
 * Update item stock (Admin only)
 */
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, action = 'SET' } = req.body;

    if (quantity === undefined) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Quantity is required'
      };
    }

    const item = await menuService.updateStock(id, parseInt(quantity), action);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Stock updated successfully',
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/menu/low-stock
 * Get low stock items (Admin only)
 */
const getLowStockItems = async (req, res, next) => {
  try {
    const items = await menuService.getLowStockItems();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Low stock items retrieved successfully',
      data: items,
      count: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  // Items
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateStock,
  getLowStockItems
};