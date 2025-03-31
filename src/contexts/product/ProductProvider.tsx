
import React from 'react';
import { ProductContext } from './ProductContext';
import { ProductProviderProps } from './productContextTypes';
import { useProductFetching } from './hooks/useProductFetching';
import { useProductOperations } from './hooks/useProductOperations';

// Add a debug log to see how many times this component renders
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  // Debug log to track component mounting
  React.useEffect(() => {
    console.log('ProductProvider mounted');
    return () => console.log('ProductProvider unmounted');
  }, []);

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
    getProductById,
    getProductBySlug
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
      getProductBySlug,
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
