
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Edit, Package, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Product } from '@/types/product';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProductTableProps {
  products: Product[];
  formatCurrency: (value: number) => string;
  handleEditClick: (product: Product) => void;
  handleDeleteProduct: (id: string) => void;
  copyCheckoutLink: (productId: string) => void;
}

const ProductTable = ({
  products,
  formatCurrency,
  handleEditClick,
  handleDeleteProduct,
  copyCheckoutLink
}: ProductTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead className="hidden md:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">Image</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className="hover:bg-gray-50">
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{formatCurrency(product.price)}</TableCell>
            <TableCell className="hidden md:table-cell max-w-xs truncate">
              {product.description || '-'}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {product.isDigital ? "Digital" : "Physical"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditClick(product)}
                >
                  <span className="sr-only">Edit</span>
                  <Edit className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <span className="sr-only">Delete</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => copyCheckoutLink(product.id)}
                >
                  <span className="sr-only">Copy Checkout Link</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {products.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No products found. Add your first product to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
