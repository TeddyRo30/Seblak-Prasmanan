import api from './api';
import { Order } from '@/types';

export interface CreateOrderPayload {
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  tableNumber?: number;
  addressId?: string;
  paymentMethod: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    levelPedas?: string;
    kuahVarian?: string;
    notes?: string;
  }>;
  notes?: string;
}

export const orderService = {
  // Create order
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const response: any = await api.post('/orders', payload);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }> => {
    const response: any = await api.get('/orders', { params });
    return {
      orders: response.data?.orders || [],
      total: response.data?.total || 0,
    };
  },

  // Get order detail
  getOrderDetail: async (orderId: string): Promise<Order> => {
    const response: any = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get order tracking
  getOrderTracking: async (orderId: string): Promise<any> => {
    const response: any = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  },

  // Get order timeline
  getOrderTimeline: async (orderId: string): Promise<any[]> => {
    const response: any = await api.get(`/orders/${orderId}/timeline`);
    return response.data || [];
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<void> => {
    await api.delete(`/orders/${orderId}`, {
      data: { reason },
    });
  },

  // Add notes to order
  addOrderNotes: async (orderId: string, notes: string): Promise<void> => {
    await api.patch(`/orders/${orderId}/notes`, { notes });
  },

  // Review item
  reviewItem: async (
    orderId: string,
    menuItemId: string,
    data: { rating: number; comment?: string }
  ): Promise<void> => {
    await api.post(`/orders/${orderId}/items/${menuItemId}/review`, data);
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<any[]> => {
    const response: any = await api.get('/payment-methods');
    return response.data || [];
  },

  // Create payment
  createPayment: async (
    orderId: string,
    paymentMethod: string
  ): Promise<any> => {
    const response: any = await api.post(`/orders/${orderId}/payment`, {
      paymentMethod,
    });
    return response.data;
  },
};