
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductContextType, 
  ProductProviderProps 
} from './product/productContextTypes';
import { 
  loadProducts, 
  createProduct, 
  updateProductData, 
  deleteProductData, 
  findProductById 
} from './product/productUtils';

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
      const newProduct = await createProduct(productData);
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

  const updateProduct = async (productData: UpdateProductInput): Promise<Product> => {
    try {
      const { updatedProduct, updatedProducts } = await updateProductData(products, productData);
      
      setProducts(updatedProducts);
      
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

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const updatedProducts = await deleteProductData(products, id);
      setProducts(updatedProducts);
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Erro",
        description: "Falha ao excluir produto",
        variant: "destructive",
      });
      return false;
    }
  };

  const getProduct = async (id: string): Promise<Product | undefined> => {
    return findProductById(products, id);
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      getProduct 
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
