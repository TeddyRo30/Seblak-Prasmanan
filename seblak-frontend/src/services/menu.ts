import api from './api';
import { MenuItem, MenuCategory } from '@/types';

export const menuService = {
  // Get all categories
  getCategories: async (): Promise<MenuCategory[]> => {
    const response: any = await api.get('/menu/categories');
    return response.data || [];
  },

  // Get category dengan items
  getCategoryWithItems: async (categoryId: string): Promise<MenuCategory> => {
    const response: any = await api.get(`/menu/categories/${categoryId}`);
    return response.data;
  },

  // Get all menu items
  getMenuItems: async (params?: {
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: MenuItem[]; total: number }> => {
    const response: any = await api.get('/menu/items', { params });
    return {
      items: response.data?.items || [],
      total: response.data?.total || 0,
    };
  },

  // Get single menu item detail
  getMenuItemDetail: async (itemId: string): Promise<MenuItem> => {
    const response: any = await api.get(`/menu/items/${itemId}`);
    return response.data;
  },

  // Get menu item reviews
  getMenuItemReviews: async (itemId: string): Promise<any[]> => {
    const response: any = await api.get(`/menu/items/${itemId}/reviews`);
    return response.data || [];
  },

  // ===== ADMIN FUNCTIONS =====

  // Create menu item (admin)
  createMenuItem: async (data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image?: string;
  }): Promise<MenuItem> => {
    const response: any = await api.post('/admin/menu/items', data);
    return response.data;
  },

  // Update menu item (admin)
  updateMenuItem: async (
    itemId: string,
    data: Partial<MenuItem>
  ): Promise<MenuItem> => {
    const response: any = await api.patch(`/admin/menu/items/${itemId}`, data);
    return response.data;
  },

  // Delete menu item (admin)
  deleteMenuItem: async (itemId: string): Promise<void> => {
    await api.delete(`/admin/menu/items/${itemId}`);
  },

  // Update menu item stock (admin)
  updateMenuItemStock: async (
    itemId: string,
    stock: number
  ): Promise<void> => {
    await api.patch(`/admin/menu/items/${itemId}/stock`, { stock });
  },

  // Get low stock items (admin)
  getLowStockItems: async (): Promise<MenuItem[]> => {
    const response: any = await api.get('/admin/menu/low-stock');
    return response.data || [];
  },

  // Create category (admin)
  createCategory: async (data: {
    name: string;
    description?: string;
  }): Promise<MenuCategory> => {
    const response: any = await api.post('/admin/menu/categories', data);
    return response.data;
  },

  // Update category (admin)
  updateCategory: async (
    categoryId: string,
    data: Partial<MenuCategory>
  ): Promise<MenuCategory> => {
    const response: any = await api.patch(`/admin/menu/categories/${categoryId}`, data);
    return response.data;
  },

  // Delete category (admin)
  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/admin/menu/categories/${categoryId}`);
  },
};