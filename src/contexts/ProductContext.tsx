
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: CreateProductInput) => Promise<Product>;
  updateProduct: (product: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initial demo products
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Assinatura CineFlick Mensal',
    price: 29.9,
    description: 'Assinatura mensal do serviço de streaming CineFlick com acesso a mais de 500 filmes.',
    imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=200&h=200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Curso de Fotografia Avançada',
    price: 247.99,
    description: 'Curso online completo de fotografia avançada com 60 horas de vídeo-aulas.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200&h=200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be a call to your backend
      // For demo purposes, we're using local data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage if available
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        // Use initial demo products if nothing in localStorage
        setProducts(initialProducts);
        localStorage.setItem('products', JSON.stringify(initialProducts));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const addProduct = async (productData: CreateProductInput): Promise<Product> => {
    try {
      // In a real implementation, this would be a call to your backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProduct: Product = {
        id: uuidv4(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
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

  const updateProduct = async (productData: UpdateProductInput): Promise<Product> => {
    try {
      // In a real implementation, this would be a call to your backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const productIndex = products.findIndex(p => p.id === productData.id);
      if (productIndex === -1) {
        throw new Error('Product not found');
      }
      
      const updatedProduct: Product = {
        ...products[productIndex],
        ...productData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedProducts = [...products];
      updatedProducts[productIndex] = updatedProduct;
      
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
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

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      // In a real implementation, this would be a call to your backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return false;
    }
  };

  const getProduct = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
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
