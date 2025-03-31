
import React, { useState, useEffect } from 'react';
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { OrderContext } from './OrderContext';
import { OrderProviderProps } from './orderContextTypes';
import { 
  loadOrders,
  createOrder, 
  filterOrdersByPaymentMethod, 
  updateOrderStatusData,
  deleteOrderData,
  deleteAllOrdersByPaymentMethodData
} from './utils';

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("OrderProvider initialized, loading orders...");
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const loadedOrders = await loadOrders();
      console.log("Orders loaded:", loadedOrders);
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
      console.log("Adding new order with data:", orderData);
      const newOrder = await createOrder(orderData);
      console.log("Order created successfully:", newOrder);
      
      // Update the local state with the new order at the beginning of the array
      setOrders(prev => [newOrder, ...prev]);
      
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

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      await deleteOrderData(id);
      
      // Update local state to remove the deleted order
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Pedido removido com sucesso",
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      toast({
        title: "Erro",
        description: "Falha ao excluir o pedido",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteAllOrdersByPaymentMethod = async (method: PaymentMethod): Promise<void> => {
    try {
      await deleteAllOrdersByPaymentMethodData(method);
      
      // Update local state to remove all orders with the specified payment method
      setOrders(prevOrders => prevOrders.filter(order => order.paymentMethod !== method));
      
      toast({
        title: "Sucesso",
        description: `Todos os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'} foram removidos`,
      });
    } catch (err) {
      console.error('Error deleting orders by payment method:', err);
      toast({
        title: "Erro",
        description: `Falha ao excluir os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  const refreshOrders = () => {
    console.log("Refreshing orders list...");
    fetchOrders();
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      error, 
      addOrder, 
      getOrdersByPaymentMethod, 
      updateOrderStatus,
      refreshOrders,
      deleteOrder,
      deleteAllOrdersByPaymentMethod
    }}>
      {children}
    </OrderContext.Provider>
  );
};
