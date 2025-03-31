
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/layout/AdminLayout';
import ProductTable from '@/components/products/ProductTable';
import AddProductDialog from '@/components/products/AddProductDialog';
import EditProductDialog from '@/components/products/EditProductDialog';
import ProductHeader from '@/components/products/ProductHeader';
import ProductDeleteConfirmation from '@/components/products/ProductDeleteConfirmation';
import { useGerenciamentoProdutos } from '@/hooks/useProductManagement';

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
    handleUseCustomProcessingChange,
    handleManualCardStatusChange,
    handleAddProduct,
    handleEditClick,
    handleDeleteClick,
    handleUpdateProduct,
    handleDeleteProduct,
    // Pagination props
    currentPage,
    pageSize,
    handlePageChange
  } = useGerenciamentoProdutos();
  
  // Added key to console log to check if component mounts multiple times
  React.useEffect(() => {
    console.log('Página de produtos montada');
    return () => console.log('Página de produtos desmontada');
  }, []);
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <Card className="shadow-md">
          <ProductHeader onAddProduct={() => setIsAddDialogOpen(true)} />
          <CardContent className="pt-6">
            <ProductTable 
              products={products}
              loading={loading}
              error={error}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onAddProduct={() => setIsAddDialogOpen(true)}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
        
        {isOffline && (
          <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200 text-amber-800">
            <p className="text-sm">
              Você está trabalhando no modo offline. As alterações serão salvas localmente 
              e sincronizadas quando sua conexão for restaurada.
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
        handleUseCustomProcessingChange={handleUseCustomProcessingChange}
        handleManualCardStatusChange={handleManualCardStatusChange}
        handleAddProduct={handleAddProduct}
      />

      <EditProductDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSwitchChange={handleSwitchChange}
        handleUseCustomProcessingChange={handleUseCustomProcessingChange}
        handleManualCardStatusChange={handleManualCardStatusChange}
        handleUpdateProduct={handleUpdateProduct}
      />

      {productToDelete && (
        <ProductDeleteConfirmation
          isOpen={isDeleteDialogOpen}
          setIsOpen={setIsDeleteDialogOpen}
          productName={productToDelete.nome}
          onConfirm={handleDeleteProduct}
        />
      )}
    </AdminLayout>
  );
};

export default Products;
