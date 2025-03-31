
import React from 'react';
import { ProductContext } from './ProductContext';
import { ProductProviderProps } from './productContextTypes';
import { useProductFetching } from './hooks/useProductFetching';
import { useProductOperations } from './hooks/useProductOperations';

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const {
    products,
    setProducts,
    loading,
    error,
    networkError: isOffline,
    retryFetchProducts
  } = useProductFetching();

  const {
    addProduct,
    editProduct,
    removeProduct,
    getProductById
  } = useProductOperations(products, setProducts, isOffline);

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      addProduct, 
      editProduct, 
      removeProduct,
      getProductById,
      refreshProducts: retryFetchProducts,
      updateProduct: editProduct,
      deleteProduct: removeProduct,
      retryFetchProducts,
      isOffline
    }}>
      {children}
    </ProductContext.Provider>
  );
};
