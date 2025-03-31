
import React, { useState, useEffect } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Order, PaymentMethod } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import OrderDetailsModal from '@/components/admin/orders/OrderDetailsModal';
import PaymentMethodTabs from '@/components/admin/orders/PaymentMethodTabs';

const Orders = () => {
  const { loading, getOrdersByPaymentMethod, refreshOrders, deleteOrder, deleteAllOrdersByPaymentMethod } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethod | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const isMobile = useIsMobile();
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

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id);
      toast({
        title: "Pedido removido",
        description: "O pedido foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o pedido.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteAllOrders = (paymentMethod: PaymentMethod) => {
    setPaymentMethodToDelete(paymentMethod);
    setIsDeleteAllDialogOpen(true);
  };

  const confirmDeleteAllOrders = async () => {
    if (!paymentMethodToDelete) return;
    
    try {
      await deleteAllOrdersByPaymentMethod(paymentMethodToDelete);
      toast({
        title: "Pedidos removidos",
        description: `Todos os pedidos via ${paymentMethodToDelete === 'PIX' ? 'PIX' : 'Cartão'} foram removidos com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover os pedidos.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteAllDialogOpen(false);
      setPaymentMethodToDelete(null);
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gerenciamento de todos os pedidos realizados</p>
        </div>
        <div className="flex gap-2">
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
      </div>

      <PaymentMethodTabs 
        pixOrders={pixOrders}
        cardOrders={cardOrders}
        onViewOrder={handleViewOrder}
        onDeleteOrder={handleDeleteOrder}
        onDeleteAllOrders={handleDeleteAllOrders}
        isMobile={isMobile}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      {/* Delete Single Order Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Orders Confirmation Dialog */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir todos os pedidos 
              {paymentMethodToDelete === 'PIX' ? ' via PIX' : ' via Cartão de Crédito'}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAllOrders}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Orders;
