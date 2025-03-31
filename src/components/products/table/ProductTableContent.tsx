
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Product } from '@/types/product';
import ProductTableRow from './ProductTableRow';
import OfflineBanner from './OfflineBanner';

interface ProductTableContentProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isOffline: boolean;
}

const ProductTableContent = ({ 
  products, 
  onEdit, 
  onDelete, 
  isOffline 
}: ProductTableContentProps) => {
  return (
    <div className="overflow-x-auto rounded-md border">
      {isOffline && <OfflineBanner />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductTableRow 
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTableContent;
