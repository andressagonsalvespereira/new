
import React from 'react';
import { OrderContext } from './OrderContext';
import { OrderProviderProps } from './orderContextTypes';
import { filterOrdersByPaymentMethod } from './utils';
import { useOrdersFetching } from './hooks/useOrdersFetching';
import { useOrderOperations } from './hooks/useOrderOperations';

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  // Use our custom hooks to manage orders state and operations
  const { 
    orders, 
    setOrders, 
    loading, 
    error, 
    refreshOrders 
  } = useOrdersFetching();

  const { 
    addOrder, 
    updateOrderStatus, 
    deleteOrder, 
    deleteAllOrdersByPaymentMethod 
  } = useOrderOperations(orders, setOrders);

  return (
    <OrderContext.Provider value={{ 
      orders, 
      loading, 
      error, 
      addOrder, 
      getOrdersByPaymentMethod: filterOrdersByPaymentMethod.bind(null, orders), 
      updateOrderStatus, 
      refreshOrders,
      deleteOrder,
      deleteAllOrdersByPaymentMethod
    }}>
      {children}
    </OrderContext.Provider>
  );
};
