
import { useState } from 'react';
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { 
  createOrder, 
  updateOrderStatusData,
  deleteOrderData,
  deleteAllOrdersByPaymentMethodData
} from '../utils';
import { logger } from '@/utils/logger';

/**
 * Hook for handling order operations like creating, updating, and deleting orders
 */
export const useOrderOperations = (orders: Order[], setOrders: React.Dispatch<React.SetStateAction<Order[]>>) => {
  const { toast } = useToast();
  const [pendingOrder, setPendingOrder] = useState(false);

  const addOrder = async (orderData: CreateOrderInput): Promise<Order> => {
    try {
      if (pendingOrder) {
        logger.warn("Solicitação de criação de pedido duplicada detectada");
        throw new Error("Já existe um pedido em processamento");
      }
      
      setPendingOrder(true);
      
      const newOrder = await createOrder(orderData);
      
      setOrders(prev => [newOrder, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Pedido adicionado com sucesso",
      });
      
      return newOrder;
    } catch (err) {
      logger.error('Erro ao adicionar pedido:', err);
      toast({
        title: "Erro",
        description: "Falha ao adicionar pedido",
        variant: "destructive",
      });
      throw err;
    } finally {
      setTimeout(() => {
        setPendingOrder(false);
      }, 1000);
    }
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
      logger.error('Erro ao atualizar status do pedido:', err);
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
      logger.error('Erro ao excluir pedido:', err);
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
      logger.error('Erro ao excluir pedidos por método de pagamento:', err);
      toast({
        title: "Erro",
        description: `Falha ao excluir os pedidos via ${method === 'PIX' ? 'PIX' : 'Cartão'}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    addOrder,
    updateOrderStatus,
    deleteOrder,
    deleteAllOrdersByPaymentMethod
  };
};
