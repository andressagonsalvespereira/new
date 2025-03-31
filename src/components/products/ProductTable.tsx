
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/ProductContext';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable = ({ products, loading, error, onEdit, onDelete }: ProductTableProps) => {
  const { toast } = useToast();
  const { retryFetchProducts, isOffline } = useProducts();
  const [loadingTimeExceeded, setLoadingTimeExceeded] = useState(false);
  
  useEffect(() => {
    // Set a timeout to show an error message if loading takes too long
    let timeoutId: number;
    
    if (loading) {
      setLoadingTimeExceeded(false);
      timeoutId = window.setTimeout(() => {
        setLoadingTimeExceeded(true);
      }, 10000); // Show error after 10 seconds of loading
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading]);
  
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="text-center text-gray-500">Loading products...</p>
          
          {loadingTimeExceeded && (
            <div className="mt-4 text-center">
              <p className="text-amber-600 mb-2">Loading is taking longer than expected.</p>
              <Button 
                variant="outline" 
                onClick={retryFetchProducts}
                className="bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-red-600 font-medium mb-4">Error loading products: {error}</p>
          <p className="text-gray-600 mb-4">Check your internet connection and try again.</p>
          <Button 
            variant="default" 
            onClick={retryFetchProducts}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          {isOffline && (
            <p className="mt-4 text-sm text-amber-600">
              Offline mode active. Some products may be unavailable or outdated.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-4">No products found</p>
        <p className="text-sm text-gray-400">Click "Add Product" to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      {isOffline && (
        <div className="bg-amber-50 p-3 border-b text-sm text-amber-800">
          <p className="flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
            Offline mode: Data may be outdated. Changes will be saved locally.
          </p>
        </div>
      )}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
