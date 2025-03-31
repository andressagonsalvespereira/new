
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
  saveProducts as saveLocalProducts,
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

  const fetchProducts = useCallback(async (): Promise<void> => {
    // Prevent multiple fetch attempts when already loading
    if (loading && hasAttemptedFetch) return;
    
    setLoading(true);
    setError(null);
    setHasAttemptedFetch(true);
    
    try {
      const formattedProducts = await fetchProductsFromAPI();
      setProducts(formattedProducts);
      
      // Sync local storage with latest data
      saveLocalProducts(formattedProducts);
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
          title: "Offline mode",
          description: "Loading products from local storage due to connection failure",
          variant: "destructive",
        });
      } catch (localErr) {
        console.error('Error loading local products:', localErr);
        toast({
          title: "Error",
          description: "Failed to load products, check your connection",
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
          title: "Product added locally",
          description: "Product will be synchronized when connection is restored",
        });
        
        return newProduct;
      }
      
      // Add product to API
      const newProduct = await addProductToAPI(productData);
      
      // Update local state
      setProducts(prev => [newProduct, ...prev]);
      
      // Also update local storage
      const updatedProducts = [newProduct, ...products];
      saveLocalProducts(updatedProducts);
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: "Error",
        description: "Failed to add product",
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
          throw new Error(`Product with ID ${id} not found`);
        }
        
        const updatedProduct = {
          ...products[existingProductIndex],
          ...productData,
        };
        
        const newProducts = [...products];
        newProducts[existingProductIndex] = updatedProduct;
        setProducts(newProducts);
        
        // Update local storage
        saveLocalProducts(newProducts);
        
        toast({
          title: "Product updated locally",
          description: "Changes will be synchronized when connection is restored",
        });
        
        return updatedProduct;
      }
      
      // Update product in API
      const updatedProduct = await editProductInAPI(id, productData);
      
      // Update local state
      const updatedProducts = products.map(prod => 
        prod.id === id ? updatedProduct : prod
      );
      
      setProducts(updatedProducts);
      
      // Update local storage
      saveLocalProducts(updatedProducts);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      throw err;
    }
  };

  const removeProduct = async (id: string): Promise<void> => {
    try {
      if (networkError) {
        // Handle offline deletion
        const updatedProducts = products.filter(prod => prod.id !== id);
        setProducts(updatedProducts);
        
        // Update local storage
        saveLocalProducts(updatedProducts);
        
        toast({
          title: "Product removed locally",
          description: "Removal will be synchronized when connection is restored",
        });
        return;
      }
      
      // Delete product from API
      await removeProductFromAPI(id);
      
      // Update local state
      const updatedProducts = products.filter(prod => prod.id !== id);
      setProducts(updatedProducts);
      
      // Update local storage
      saveLocalProducts(updatedProducts);
      
      toast({
        title: "Success",
        description: "Product removed successfully",
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to remove product",
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
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Add a retry mechanism with force refresh
  const retryFetchProducts = useCallback(async (): Promise<void> => {
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
      refreshProducts: retryFetchProducts, 
      updateProduct: editProduct,
      deleteProduct: removeProduct,
      retryFetchProducts,
      isOffline: networkError
    }}>
      {children}
    </ProductContext.Provider>
  );
};
