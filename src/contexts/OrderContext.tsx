
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CreateOrderInput } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { 
  OrderContextType, 
  OrderProviderProps 
} from './order/orderContextTypes';
import { 
  loadOrders, 
  saveOrders, 
  createOrder, 
  filterOrdersByPaymentMethod, 
  updateOrderStatusData 
} from './order/orderUtils';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const loadedOrders = loadOrders();
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newOrder = createOrder(orderData);
      const updatedOrders = [...orders, newOrder];
      
      setOrders(updatedOrders);
      saveOrders(updatedOrders);
      
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

  const getOrdersByPaymentMethod = (method: 'pix' | 'card'): Order[] => {
    return filterOrdersByPaymentMethod(orders, method);
  };

  const updateOrderStatus = async (
    id: string, 
    status: Order['paymentStatus']
  ): Promise<Order> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { updatedOrder, updatedOrders } = updateOrderStatusData(orders, id, status);
      
      setOrders(updatedOrders);
      saveOrders(updatedOrders);
      
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

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
