
import React, { useState, useEffect } from 'react';
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { OrderContext } from './OrderContext';
import { OrderProviderProps } from './orderContextTypes';
import { 
  loadOrders,
  createOrder, 
  filterOrdersByPaymentMethod, 
  updateOrderStatusData 
} from './orderUtils';

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const loadedOrders = await loadOrders();
      setOrders(loadedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
      toast({
        title: "Erro",
        description: "Falha ao carregar pedidos",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const addOrder = async (orderData: CreateOrderInput): Promise<Order> => {
    try {
      const newOrder = await createOrder(orderData);
      setOrders(prev => [...prev, newOrder]);
      
      toast({
        title: "Sucesso",
        description: "Pedido adicionado com sucesso",
      });
      
      return newOrder;
    } catch (err) {
      console.error('Error adding order:', err);
      toast({
        title: "Erro",
        description: "Falha ao adicionar pedido",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getOrdersByPaymentMethod = (method: PaymentMethod): Order[] => {
    return filterOrdersByPaymentMethod(orders, method);
  };

  const updateOrderStatus = async (
    id: string, 
    status: Order['paymentStatus']
  ): Promise<Order> => {
    try {
      const { updatedOrder, updatedOrders } = await updateOrderStatusData(orders, id, status);
      
      setOrders(updatedOrders);
      
      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado com sucesso",
      });
      
      return updatedOrder;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do pedido",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      error, 
      addOrder, 
      getOrdersByPaymentMethod, 
      updateOrderStatus 
    }}>
      {children}
    </OrderContext.Provider>
  );
};
