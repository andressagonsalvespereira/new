
import React, { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { Order, PaymentMethod } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

import OrderDetailsModal from '@/components/admin/orders/OrderDetailsModal';
import PaymentMethodTabs from '@/components/admin/orders/PaymentMethodTabs';

const Orders = () => {
  const { loading, getOrdersByPaymentMethod, refreshOrders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const pixOrders = getOrdersByPaymentMethod('PIX' as PaymentMethod);
  const cardOrders = getOrdersByPaymentMethod('CREDIT_CARD' as PaymentMethod);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleRefreshOrders = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast({
        title: "Lista atualizada",
        description: "A lista de pedidos foi atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista de pedidos.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("Lista de pedidos PIX:", pixOrders);
    console.log("Lista de pedidos Cartão:", cardOrders);
  }, [pixOrders, cardOrders]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Carregando pedidos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gerenciamento de todos os pedidos realizados</p>
        </div>
        <Button 
          onClick={handleRefreshOrders} 
          disabled={isRefreshing}
          className="flex items-center"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      <PaymentMethodTabs 
        pixOrders={pixOrders}
        cardOrders={cardOrders}
        onViewOrder={handleViewOrder}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </DashboardLayout>
  );
};

export default Orders;
