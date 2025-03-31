
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CreateProductInput } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { 
  ProductContextType, 
  ProductProviderProps 
} from '@/contexts/product/productContextTypes';
import { supabase } from '@/integrations/supabase/client';

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
      // Get products from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProducts(data as Product[]);
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
      // Add product to Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) throw error;
      
      const newProduct = data as Product;
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
      // Update product in Supabase
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedProduct = data as Product;
      
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
      // Delete product from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      return data as Product;
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
