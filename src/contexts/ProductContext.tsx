
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CreateProductInput } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductContextType, 
  ProductProviderProps 
} from '@/contexts/product/productContextTypes';
import { 
  loadProducts,
  createProduct as createProductUtil,
  updateProduct as updateProductUtil,
  deleteProduct as deleteProductUtil,
  getProductById as getProductByIdUtil
} from '@/contexts/product/productUtils';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const loadedProducts = await loadProducts();
      setProducts(loadedProducts);
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const addProduct = async (productData: CreateProductInput): Promise<Product> => {
    try {
      const newProduct = createProductUtil(productData);
      setProducts(prev => [...prev, newProduct]);
      
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
      const updatedProduct = await updateProductUtil(id, productData);
      
      setProducts(prev => 
        prev.map(prod => 
          prod.id === id ? { ...prod, ...updatedProduct } : prod
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
      await deleteProductUtil(id);
      
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

  // Updated to resolve types properly for async operation
  const getProductById = async (id: string): Promise<Product | undefined> => {
    try {
      return await getProductByIdUtil(id);
    } catch (err) {
      console.error('Error getting product by ID:', err);
      toast({
        title: "Erro",
        description: "Falha ao buscar produto",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      addProduct, 
      editProduct, 
      removeProduct,
      getProductById,
      refreshProducts: fetchProducts,
      updateProduct: editProduct,
      deleteProduct: removeProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
