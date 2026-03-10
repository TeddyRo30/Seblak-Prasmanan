// src/services/menuService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all menu categories
 */
const getAllCategories = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, orderBy = 'displayOrder' } = options;

    const categories = await prisma.menuCategory.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        [orderBy]: 'asc'
      },
      include: {
        items: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            pricePerUnit: true
          }
        }
      }
    });

    const total = await prisma.menuCategory.count();

    return {
      data: categories,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get category by ID with items
 */
const getCategoryById = async (categoryId) => {
  try {
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!category) {
      throw {
        status: 404,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Menu category not found'
      };
    }

    return category;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new category (Admin only)
 */
const createCategory = async (data) => {
  try {
    const { name, description } = data;

    if (!name) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Category name is required'
      };
    }

    // Check if category already exists
    const existing = await prisma.menuCategory.findUnique({
      where: { name }
    });

    if (existing) {
      throw {
        status: 409,
        code: 'CATEGORY_EXISTS',
        message: 'Category with this name already exists'
      };
    }

    // Get max displayOrder
    const lastCategory = await prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'desc' },
      take: 1
    });

    const displayOrder = lastCategory.length > 0 ? lastCategory[0].displayOrder + 1 : 0;

    const category = await prisma.menuCategory.create({
      data: {
        name,
        description: description || null,
        displayOrder
      }
    });

    return category;
  } catch (error) {
    throw error;
  }
};

/**
 * Update category (Admin only)
 */
const updateCategory = async (categoryId, data) => {
  try {
    const { name, description, displayOrder } = data;

    // Check if category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw {
        status: 404,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Menu category not found'
      };
    }

    // Check if new name already exists (if changing name)
    if (name && name !== category.name) {
      const existing = await prisma.menuCategory.findUnique({
        where: { name }
      });

      if (existing) {
        throw {
          status: 409,
          code: 'CATEGORY_EXISTS',
          message: 'Category with this name already exists'
        };
      }
    }

    const updated = await prisma.menuCategory.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(displayOrder !== undefined && { displayOrder })
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete category (Admin only)
 */
const deleteCategory = async (categoryId) => {
  try {
    // Check if category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw {
        status: 404,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Menu category not found'
      };
    }

    // Check if category has items
    const itemCount = await prisma.menuItem.count({
      where: { categoryId }
    });

    if (itemCount > 0) {
      throw {
        status: 400,
        code: 'CATEGORY_HAS_ITEMS',
        message: `Cannot delete category with ${itemCount} items`
      };
    }

    await prisma.menuCategory.delete({
      where: { id: categoryId }
    });

    return { message: 'Category deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all menu items with filters
 */
const getAllMenuItems = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, categoryId, search, onlyAvailable = true } = options;

    const where = {
      ...(onlyAvailable && { isAvailable: true }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      })
    };

    const items = await prisma.menuItem.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { displayOrder: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const total = await prisma.menuItem.count({ where });

    return {
      data: items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get menu item by ID
 */
const getMenuItemById = async (itemId) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        category: true
      }
    });

    if (!item) {
      throw {
        status: 404,
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found'
      };
    }

    return item;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new menu item (Admin only)
 */
const createMenuItem = async (data) => {
  try {
    const { categoryId, name, description, pricePerUnit, unit, stockQuantity, lowStockThreshold, imageUrl } = data;

    // Validate required fields
    if (!categoryId || !name || !pricePerUnit || !unit) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'categoryId, name, pricePerUnit, and unit are required'
      };
    }

    // Verify category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw {
        status: 404,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found'
      };
    }

    // Get max displayOrder in category
    const lastItem = await prisma.menuItem.findMany({
      where: { categoryId },
      orderBy: { displayOrder: 'desc' },
      take: 1
    });

    const displayOrder = lastItem.length > 0 ? lastItem[0].displayOrder + 1 : 0;

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        description: description || null,
        pricePerUnit: parseInt(pricePerUnit),
        unit,
        stockQuantity: parseInt(stockQuantity || 0),
        lowStockThreshold: parseInt(lowStockThreshold || 10),
        imageUrl: imageUrl || null,
        isAvailable: true,
        displayOrder
      },
      include: {
        category: true
      }
    });

    return item;
  } catch (error) {
    throw error;
  }
};

/**
 * Update menu item (Admin only)
 */
const updateMenuItem = async (itemId, data) => {
  try {
    const { name, description, pricePerUnit, stockQuantity, lowStockThreshold, imageUrl, isAvailable, displayOrder } = data;

    // Check if item exists
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw {
        status: 404,
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found'
      };
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(pricePerUnit && { pricePerUnit: parseInt(pricePerUnit) }),
        ...(stockQuantity !== undefined && { stockQuantity: parseInt(stockQuantity) }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(displayOrder !== undefined && { displayOrder })
      },
      include: {
        category: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete menu item (Admin only)
 */
const deleteMenuItem = async (itemId) => {
  try {
    // Check if item exists
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw {
        status: 404,
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found'
      };
    }

    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    return { message: 'Item deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Update item stock (Admin only)
 */
const updateStock = async (itemId, quantity, action = 'SET') => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw {
        status: 404,
        code: 'ITEM_NOT_FOUND',
        message: 'Menu item not found'
      };
    }

    let newQuantity = item.stockQuantity;

    if (action === 'ADD') {
      newQuantity = item.stockQuantity + quantity;
    } else if (action === 'SUBTRACT') {
      newQuantity = Math.max(0, item.stockQuantity - quantity);
    } else {
      newQuantity = quantity;
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        stockQuantity: newQuantity,
        isAvailable: newQuantity > 0
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Get low stock items (Admin only)
 */
const getLowStockItems = async () => {
  try {
    const items = await prisma.menuItem.findMany({
      where: {
        stockQuantity: {
          lte: prisma.raw('lowStockThreshold')
        }
      },
      include: {
        category: true
      },
      orderBy: { stockQuantity: 'asc' }
    });

    return items;
  } catch (error) {
    throw error;
  }
};

export default {
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  // Menu Items
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateStock,
  getLowStockItems
};