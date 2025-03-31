
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';
import { Product, CreateProductInput } from '@/types/product';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/products/ProductTable';
import AddProductDialog from '@/components/products/AddProductDialog';
import EditProductDialog from '@/components/products/EditProductDialog';

const Products: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isDigital: false
  });

  const { toast } = useToast();
  const { 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    products: contextProducts, 
    loading, 
    error,
    refreshProducts 
  } = useProducts();

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isDigital: checked
    });
  };

  const handleAddProduct = async () => {
    try {
      await addProduct(formData);
      
      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        isDigital: false
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar produto",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      imageUrl: product.imageUrl || '',
      isDigital: product.isDigital
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.id, formData);
      
      // Reset form and close dialog
      setIsEditDialogOpen(false);
      setEditingProduct(null);

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover produto",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Gerenciar Produtos</CardTitle>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </CardHeader>
          <CardContent>
            <ProductTable 
              products={contextProducts}
              loading={loading}
              error={error}
              onEdit={handleEditClick}
              onDelete={handleDeleteProduct}
            />
          </CardContent>
        </Card>
      </div>

      <AddProductDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSwitchChange={handleSwitchChange}
        handleAddProduct={handleAddProduct}
      />

      <EditProductDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSwitchChange={handleSwitchChange}
        handleUpdateProduct={handleUpdateProduct}
      />
    </AdminLayout>
  );
};

export default Products;
