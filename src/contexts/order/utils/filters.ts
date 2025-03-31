
import { Order, PaymentMethod } from '@/types/order';

// Filter orders by payment method
export const filterOrdersByPaymentMethod = (orders: Order[], method: PaymentMethod): Order[] => {
  return orders.filter(order => order.paymentMethod === method);
};
