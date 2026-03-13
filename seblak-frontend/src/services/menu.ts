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
};