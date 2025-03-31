
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/contexts/ProductContext';
import { CreateProductInput, Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import AddProductDialog from '@/components/products/AddProductDialog';
import EditProductDialog from '@/components/products/EditProductDialog';
import ProductTable from '@/components/products/ProductTable';

const Products = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    isDigital: false,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isDigital: checked
    }));
  };

  const handleAddProduct = async () => {
    if (!formData.name || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Name and price are required. Price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addProduct(formData);
      setFormData({
        name: '',
        price: 0,
        description: '',
        imageUrl: '',
        isDigital: false,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      isDigital: product.isDigital,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    if (!formData.name || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Name and price are required. Price must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = {
        id: editingProduct.id,
        ...formData
      };
      await updateProduct(updateData);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const copyCheckoutLink = (productId: string) => {
    const checkoutUrl = `${window.location.origin}/quick-checkout/${productId}`;
    navigator.clipboard.writeText(checkoutUrl);
    toast({
      title: "Link Copied",
      description: "Quick checkout link copied to clipboard",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <p>Loading products...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products</h1>
          <AddProductDialog
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSwitchChange={handleSwitchChange}
            handleAddProduct={handleAddProduct}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductTable
              products={products}
              formatCurrency={formatCurrency}
              handleEditClick={handleEditClick}
              handleDeleteProduct={handleDeleteProduct}
              copyCheckoutLink={copyCheckoutLink}
            />
          </CardContent>
        </Card>
      </div>

      <EditProductDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSwitchChange={handleSwitchChange}
        handleUpdateProduct={handleUpdateProduct}
      />
    </DashboardLayout>
  );
};

export default Products;
