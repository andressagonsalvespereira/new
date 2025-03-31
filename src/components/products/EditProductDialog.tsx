
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CreateProductInput } from '@/types/product';
import ProductFormFields from './ProductFormFields';

interface EditProductDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  formData: CreateProductInput;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
  handleUpdateProduct: () => void;
}

const EditProductDialog = ({
  isOpen,
  setIsOpen,
  formData,
  handleInputChange,
  handleSwitchChange,
  handleUpdateProduct
}: EditProductDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent aria-describedby="edit-product-description">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription id="edit-product-description">
            Update the details of the existing product in your catalog.
          </DialogDescription>
        </DialogHeader>
        <ProductFormFields 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSwitchChange={handleSwitchChange}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handleUpdateProduct}
          >
            Update Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
