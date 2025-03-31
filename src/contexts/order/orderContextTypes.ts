
import React from 'react';
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';

export interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (orderData: CreateOrderInput) => Promise<Order>;
  getOrdersByPaymentMethod: (method: PaymentMethod) => Order[];
  updateOrderStatus: (id: string, status: Order['paymentStatus']) => Promise<Order>;
  refreshOrders: () => void;
  deleteOrder: (id: string) => Promise<void>;
  deleteAllOrdersByPaymentMethod: (method: PaymentMethod) => Promise<void>;
}

export interface OrderProviderProps {
  children: React.ReactNode;
}
