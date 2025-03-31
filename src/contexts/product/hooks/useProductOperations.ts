
import { useState, useCallback } from 'react';
import { Product, CreateProductInput } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { 
  addProductToAPI, 
  editProductInAPI, 
  removeProductFromAPI, 
  getProductByIdFromAPI 
} from '../productApi';
import { 
  saveProducts,
  createProduct as createLocalProduct,
  updateProduct as updateLocalProduct,
  deleteProduct as deleteLocalProduct,
  getProductById as getLocalProductById
} from '../productUtils';

export const useProductOperations = (products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, networkError: boolean) => {
  const { toast } = useToast();

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
      saveProducts(updatedProducts);
      
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
        saveProducts(newProducts);
        
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
      saveProducts(updatedProducts);
      
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
        saveProducts(updatedProducts);
        
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
      saveProducts(updatedProducts);
      
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

  return {
    addProduct,
    editProduct,
    removeProduct,
    getProductById
  };
};
