
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/layout/AdminLayout';
import ProductTable from '@/components/products/ProductTable';
import AddProductDialog from '@/components/products/AddProductDialog';
import EditProductDialog from '@/components/products/EditProductDialog';
import ProductHeader from '@/components/products/ProductHeader';
import ProductDeleteConfirmation from '@/components/products/ProductDeleteConfirmation';
import { useProductManagement } from '@/hooks/useProductManagement';

const Products: React.FC = () => {
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
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
  } = useProductManagement();
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <Card className="shadow-md">
          <ProductHeader onAddProduct={() => setIsAddDialogOpen(true)} />
          <CardContent>
            <ProductTable 
              products={products}
              loading={loading}
              error={error}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </CardContent>
        </Card>
        
        {isOffline && (
          <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200 text-amber-800">
            <p className="text-sm">
              You are currently working in offline mode. Changes will be saved locally 
              and synchronized when your connection is restored.
            </p>
          </div>
        )}
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

      {productToDelete && (
        <ProductDeleteConfirmation
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          productName={productToDelete.name}
          onConfirm={handleDeleteProduct}
        />
      )}
    </AdminLayout>
  );
};

export default Products;
