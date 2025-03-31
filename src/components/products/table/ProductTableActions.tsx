
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

interface ProductTableActionsProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTableActions = ({ product, onEdit, onDelete }: ProductTableActionsProps) => {
  const { toast } = useToast();
  
  const copyCheckoutLink = (productId: string) => {
    const baseUrl = window.location.origin;
    const checkoutUrl = `${baseUrl}/quick-checkout/${productId}`;
    
    navigator.clipboard.writeText(checkoutUrl)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Quick checkout link copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Error copying link:', err);
        toast({
          title: "Error",
          description: "Could not copy link",
          variant: "destructive",
        });
      });
  };

  const openCheckoutLink = (productId: string) => {
    const baseUrl = window.location.origin;
    const checkoutUrl = `${baseUrl}/quick-checkout/${productId}`;
    window.open(checkoutUrl, '_blank');
  };
  
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyCheckoutLink(product.id)}
        title="Copy quick checkout link"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openCheckoutLink(product.id)}
        title="Open quick checkout"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => onEdit(product)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(product)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
};

export default ProductTableActions;
