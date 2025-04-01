import React, { useState, useEffect, useRef } from 'react';
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
  const pendingOrderRef = useRef(false);

  useEffect(() => {
    console.log("OrderProvider inicializado, carregando pedidos...");
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const loadedOrders = await loadOrders();
      console.log("Pedidos carregados:", loadedOrders.length);
      setOrders(loadedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Falha ao carregar pedidos');
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
      if (pendingOrderRef.current) {
        console.warn("Solicitação de criação de pedido duplicada detectada");
        throw new Error("Já existe um pedido em processamento");
      }
      
      pendingOrderRef.current = true;
      console.log("Adicionando novo pedido com dados:", {
        customer: {
          name: orderData.customer.name,
          email: orderData.customer.email
        },
        productId: orderData.productId,
        productName: orderData.productName,
        productPrice: orderData.productPrice,
        paymentMethod: orderData.paymentMethod
      });
      
      const newOrder = await createOrder(orderData);
      console.log("Pedido criado com sucesso:", newOrder.id);
      
      setOrders(prev => [newOrder, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Pedido adicionado com sucesso",
      });
      
      return newOrder;
    } catch (err) {
      console.error('Erro ao adicionar pedido:', err);
      toast({
        title: "Erro",
        description: "Falha ao adicionar pedido",
        variant: "destructive",
      });
      throw err;
    } finally {
      setTimeout(() => {
        pendingOrderRef.current = false;
      }, 1000);
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
      console.error('Erro ao atualizar status do pedido:', err);
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
      
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Pedido removido com sucesso",
      });
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
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
      
      setOrders(prevOrders => prevOrders.filter(order => order.paymentMethod !== method));
      
      toast({
        title: "Sucesso",
        description: `Todos os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'} foram removidos`,
      });
    } catch (err) {
      console.error('Erro ao excluir pedidos por método de pagamento:', err);
      toast({
        title: "Erro",
        description: `Falha ao excluir os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  const refreshOrders = () => {
    console.log("Atualizando lista de pedidos...");
    fetchOrders();
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      error, 
      addOrder, 
      getOrdersByPaymentMethod: filterOrdersByPaymentMethod.bind(null, orders), 
      updateOrderStatus: async (id, status) => {
        try {
          const { updatedOrder, updatedOrders } = await updateOrderStatusData(orders, id, status);
          setOrders(updatedOrders);
          toast({
            title: "Sucesso",
            description: "Status do pedido atualizado com sucesso",
          });
          return updatedOrder;
        } catch (err) {
          console.error('Erro ao atualizar status do pedido:', err);
          toast({
            title: "Erro",
            description: "Falha ao atualizar status do pedido",
            variant: "destructive",
          });
          throw err;
        }
      },
      refreshOrders,
      deleteOrder: async (id) => {
        try {
          await deleteOrderData(id);
          setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
          toast({
            title: "Sucesso",
            description: "Pedido removido com sucesso",
          });
        } catch (err) {
          console.error('Erro ao excluir pedido:', err);
          toast({
            title: "Erro",
            description: "Falha ao excluir o pedido",
            variant: "destructive",
          });
          throw err;
        }
      },
      deleteAllOrdersByPaymentMethod: async (method) => {
        try {
          await deleteAllOrdersByPaymentMethodData(method);
          setOrders(prevOrders => prevOrders.filter(order => order.paymentMethod !== method));
          toast({
            title: "Sucesso",
            description: `Todos os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'} foram removidos`,
          });
        } catch (err) {
          console.error('Erro ao excluir pedidos por método de pagamento:', err);
          toast({
            title: "Erro",
            description: `Falha ao excluir os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'}`,
            variant: "destructive",
          });
          throw err;
        }
      }
    }}>
      {children}
    </OrderContext.Provider>
  );
};
