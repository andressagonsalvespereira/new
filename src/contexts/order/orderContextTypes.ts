
import { ReactNode } from 'react';
import { Order, CreateOrderInput } from '@/types/order';

export interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: CreateOrderInput) => Promise<Order>;
  getOrdersByPaymentMethod: (method: 'pix' | 'card') => Order[];
  updateOrderStatus: (id: string, status: Order['paymentStatus']) => Promise<Order>;
}

export interface OrderProviderProps {
  children: ReactNode;
}
