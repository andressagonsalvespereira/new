
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { CreateProductInput } from '@/types/product';
import ProductFormFields from './ProductFormFields';

interface AddProductDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  formData: CreateProductInput;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
  handleAddProduct: () => void;
}

const AddProductDialog = ({
  isOpen,
  setIsOpen,
  formData,
  handleInputChange,
  handleSwitchChange,
  handleAddProduct
}: AddProductDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="add-product-description">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription id="add-product-description">
            Fill in the details of the new product you want to add to your catalog.
          </DialogDescription>
        </DialogHeader>
        <ProductFormFields 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSwitchChange={handleSwitchChange}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddProduct}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
