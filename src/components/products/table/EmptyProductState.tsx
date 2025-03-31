
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyProductStateProps {
  onAddProduct?: () => void;
}

const EmptyProductState = ({ onAddProduct }: EmptyProductStateProps) => {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-lg">
      <p className="text-gray-500 mb-4">No products found</p>
      <p className="text-sm text-gray-400 mb-4">Click "Add Product" to get started</p>
      
      {onAddProduct && (
        <Button onClick={onAddProduct} size="sm" className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      )}
    </div>
  );
};

export default EmptyProductState;
