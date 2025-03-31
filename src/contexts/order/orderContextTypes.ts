
import { ReactNode } from 'react';
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';

export interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: CreateOrderInput) => Promise<Order>;
  getOrdersByPaymentMethod: (method: PaymentMethod) => Order[];
  updateOrderStatus: (id: string, status: Order['paymentStatus']) => Promise<Order>;
}

export interface OrderProviderProps {
  children: ReactNode;
}
