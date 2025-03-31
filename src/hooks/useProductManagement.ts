
import { useState, useCallback } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { useToast } from '@/hooks/use-toast';
import { Product, CreateProductInput } from '@/types/product';

const initialFormState: CreateProductInput = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  isDigital: false
};

export const useProductManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductInput>(initialFormState);

  const { toast } = useToast();
  const { 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    products, 
    loading, 
    error,
    refreshProducts,
    isOffline
  } = useProducts();

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const handleSwitchChange = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isDigital: checked
    }));
  }, []);

  const handleAddProduct = async () => {
    try {
      await addProduct(formData);
      resetForm();
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      imageUrl: product.imageUrl || '',
      isDigital: product.isDigital
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.id, formData);
      setIsEditDialogOpen(false);
      setEditingProduct(null);

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      
      toast({
        title: "Success",
        description: "Product removed successfully",
      });
    } catch (error) {
      console.error('Error removing product:', error);
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive",
      });
    }
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingProduct,
    productToDelete,
    formData,
    products,
    loading,
    error,
    isOffline,
    handleInputChange,
    handleSwitchChange,
    handleAddProduct,
    handleEditClick,
    handleDeleteClick,
    handleUpdateProduct,
    handleDeleteProduct,
    refreshProducts,
    resetForm
  };
};
