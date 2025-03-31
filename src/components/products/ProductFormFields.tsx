
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreateProductInput } from '@/types/product';

interface ProductFormFieldsProps {
  formData: CreateProductInput;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
}

const ProductFormFields = ({ formData, handleInputChange, handleSwitchChange }: ProductFormFieldsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name*</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price (R$)*</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.price || ''}
          onChange={handleInputChange}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl || ''}
          onChange={handleInputChange}
          className="col-span-3"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isDigital" className="text-right">Digital Product</Label>
        <div className="flex items-center space-x-2 col-span-3">
          <Switch
            id="isDigital"
            checked={formData.isDigital}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="isDigital" className="cursor-pointer">
            {formData.isDigital ? "Digital Product" : "Physical Product"}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ProductFormFields;
