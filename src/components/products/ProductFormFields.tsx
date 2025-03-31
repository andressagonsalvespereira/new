
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateProductInput } from '@/types/product';

interface ProductFormFieldsProps {
  formData: CreateProductInput;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchChange: (checked: boolean) => void;
  handleUseCustomProcessingChange?: (checked: boolean) => void;
  handleManualCardStatusChange?: (value: string) => void;
}

const ProductFormFields = ({ 
  formData, 
  handleInputChange, 
  handleSwitchChange,
  handleUseCustomProcessingChange,
  handleManualCardStatusChange
}: ProductFormFieldsProps) => {
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
      
      {/* Seção de configuração de processamento de pagamento específica */}
      <div className="border-t mt-4 pt-4">
        <h3 className="font-medium mb-2">Payment Processing Settings</h3>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="useCustomProcessing" className="text-right">Custom Payment Processing</Label>
          <div className="flex items-center space-x-2 col-span-3">
            <Switch
              id="useCustomProcessing"
              checked={formData.useCustomProcessing || false}
              onCheckedChange={handleUseCustomProcessingChange}
            />
            <Label htmlFor="useCustomProcessing" className="cursor-pointer">
              {formData.useCustomProcessing ? "Use custom payment settings" : "Use global payment settings"}
            </Label>
          </div>
        </div>
        
        {formData.useCustomProcessing && (
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <Label htmlFor="manualCardStatus" className="text-right">Card Payment Status</Label>
            <div className="col-span-3">
              <Select 
                value={formData.manualCardStatus || 'ANALYSIS'} 
                onValueChange={handleManualCardStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Auto-approved</SelectItem>
                  <SelectItem value="DENIED">Auto-declined</SelectItem>
                  <SelectItem value="ANALYSIS">Manual analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFormFields;
