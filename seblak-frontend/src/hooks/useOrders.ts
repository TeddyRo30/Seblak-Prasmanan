import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services/order';

interface UseOrdersOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export function useOrders(options?: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await orderService.getUserOrders(options);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [options?.status, options?.limit, options?.offset]);

  const getOrderDetail = async (orderId: string): Promise<Order> => {
    try {
      return await orderService.getOrderDetail(orderId);
    } catch (err) {
      throw err;
    }
  };

  const getOrderTracking = async (orderId: string) => {
    try {
      return await orderService.getOrderTracking(orderId);
    } catch (err) {
      throw err;
    }
  };

  const getOrderTimeline = async (orderId: string) => {
    try {
      return await orderService.getOrderTimeline(orderId);
    } catch (err) {
      throw err;
    }
  };

  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      await orderService.cancelOrder(orderId, reason);
      // Refetch orders after cancel
      await fetchOrders();
    } catch (err) {
      throw err;
    }
  };

  const addOrderNotes = async (orderId: string, notes: string) => {
    try {
      await orderService.addOrderNotes(orderId, notes);
    } catch (err) {
      throw err;
    }
  };

  const reviewItem = async (
    orderId: string,
    menuItemId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      await orderService.reviewItem(orderId, menuItemId, {
        rating,
        comment,
      });
    } catch (err) {
      throw err;
    }
  };

  return {
    orders,
    total,
    isLoading,
    error,
    refetch: fetchOrders,
    getOrderDetail,
    getOrderTracking,
    getOrderTimeline,
    cancelOrder,
    addOrderNotes,
    reviewItem,
  };
}