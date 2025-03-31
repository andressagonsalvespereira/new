import React, { useState, useEffect, useCallback } from 'react';
import { Product, CreateProductInput } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductContextType, 
  ProductProviderProps 
} from '@/contexts/product/productContextTypes';
import { ProductContext } from './ProductContext';
import { 
  fetchProductsFromAPI, 
  addProductToAPI, 
  editProductInAPI, 
  removeProductFromAPI, 
  getProductByIdFromAPI 
} from './productApi';
import { 
  loadProducts as loadLocalProducts, 
  createProduct as createLocalProduct,
  updateProduct as updateLocalProduct,
  deleteProduct as deleteLocalProduct,
  getProductById as getLocalProductById
} from './productUtils';

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchProducts = useCallback(async () => {
    // Prevent multiple fetch attempts when already loading
    if (loading && hasAttemptedFetch) return;
    
    setLoading(true);
    setError(null);
    setHasAttemptedFetch(true);
    
    try {
      const formattedProducts = await fetchProductsFromAPI();
      
      setProducts(formattedProducts);
      setNetworkError(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
      
      // If we have a network error, try to load from local storage as fallback
      try {
        const localProducts = loadLocalProducts();
        setProducts(localProducts);
        setNetworkError(true);
        toast({
          title: "Modo offline",
          description: "Carregando produtos do armazenamento local devido a falha de conexão",
          variant: "destructive",
        });
      } catch (localErr) {
        console.error('Error loading local products:', localErr);
        toast({
          title: "Erro",
          description: "Falha ao carregar produtos, verifique sua conexão",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, loading, hasAttemptedFetch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: CreateProductInput): Promise<Product> => {
    try {
      if (networkError) {
        // If we're offline, create product locally
        const newProduct = createLocalProduct(productData);
        setProducts(prev => [newProduct, ...prev]);
        
        toast({
          title: "Produto adicionado localmente",
          description: "Produto será sincronizado quando a conexão for restaurada",
        });
        
        return newProduct;
      }
      
      // Add product to API
      const newProduct = await addProductToAPI(productData);
      
      setProducts(prev => [newProduct, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
      
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto",
        variant: "destructive",
      });
      throw err;
    }
  };

  const editProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      if (networkError) {
        // Handle offline editing
        const existingProductIndex = products.findIndex(p => p.id === id);
        if (existingProductIndex === -1) {
          throw new Error(`Produto com ID ${id} não encontrado`);
        }
        
        const updatedProduct = {
          ...products[existingProductIndex],
          ...productData,
        };
        
        const newProducts = [...products];
        newProducts[existingProductIndex] = updatedProduct;
        setProducts(newProducts);
        
        toast({
          title: "Produto atualizado localmente",
          description: "As alterações serão sincronizadas quando a conexão for restaurada",
        });
        
        return updatedProduct;
      }
      
      // Update product in API
      const updatedProduct = await editProductInAPI(id, productData);
      
      setProducts(prev => 
        prev.map(prod => 
          prod.id === id ? updatedProduct : prod
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
      
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Erro",
        description: "Falha ao atualizar produto",
        variant: "destructive",
      });
      throw err;
    }
  };

  const removeProduct = async (id: string): Promise<void> => {
    try {
      if (networkError) {
        // Handle offline deletion
        setProducts(prev => prev.filter(prod => prod.id !== id));
        
        toast({
          title: "Produto removido localmente",
          description: "A remoção será sincronizada quando a conexão for restaurada",
        });
        return;
      }
      
      // Delete product from API
      await removeProductFromAPI(id);
      
      setProducts(prev => prev.filter(prod => prod.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso",
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Erro",
        description: "Falha ao remover produto",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getProductById = async (id: string): Promise<Product | undefined> => {
    try {
      if (networkError) {
        // Handle offline product lookup
        return getLocalProductById(id) || products.find(p => p.id === id);
      }
      
      return await getProductByIdFromAPI(id);
    } catch (err) {
      console.error('Error getting product by ID:', err);
      // Try to get from cached products as fallback
      const cachedProduct = products.find(p => p.id === id);
      if (cachedProduct) {
        console.log('Returning cached product:', cachedProduct);
        return cachedProduct;
      }
      
      toast({
        title: "Erro",
        description: "Falha ao buscar produto",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Add a retry mechanism with force refresh
  const retryFetchProducts = useCallback((): Promise<void> => {
    setNetworkError(false);
    setHasAttemptedFetch(false);
    return fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      addProduct, 
      editProduct, 
      removeProduct,
      getProductById,
      refreshProducts: retryFetchProducts, // Use retryFetchProducts for refreshing
      updateProduct: editProduct,
      deleteProduct: removeProduct,
      retryFetchProducts,
      isOffline: networkError
    }}>
      {children}
    </ProductContext.Provider>
  );
};
