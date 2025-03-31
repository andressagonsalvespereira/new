
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Product } from '@/types/product';
import ProductTableActions from './ProductTableActions';

interface ProductTableRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTableRow = ({ product, onEdit, onDelete }: ProductTableRowProps) => {
  return (
    <TableRow key={product.id}>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
      <TableCell>R$ {product.price.toFixed(2)}</TableCell>
      <TableCell>
        {product.imageUrl ? (
          <div className="h-10 w-10 overflow-hidden rounded-md">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        ) : (
          <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded-md">
            <span className="text-xs text-gray-500">No image</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <span className={`px-2 py-1 text-xs rounded-full ${product.isDigital ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {product.isDigital ? 'Digital' : 'Physical'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <ProductTableActions
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
