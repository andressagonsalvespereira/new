
import React, { useEffect } from 'react';
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
    handleInputChange,
    handleSwitchChange,
    handleAddProduct,
    handleEditClick,
    handleDeleteClick,
    handleUpdateProduct,
    handleDeleteProduct,
    refreshProducts
  } = useProductManagement();

  // We no longer call refreshProducts in the useEffect because it's already 
  // called in the ProductProvider initialization
  
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
