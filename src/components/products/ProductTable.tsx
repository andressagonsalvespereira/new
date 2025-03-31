
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTable = ({ products, loading, error, onEdit, onDelete }: ProductTableProps) => {
  const { toast } = useToast();
  
  const copyCheckoutLink = (productId: string) => {
    const baseUrl = window.location.origin;
    const checkoutUrl = `${baseUrl}/quick-checkout/${productId}`;
    
    navigator.clipboard.writeText(checkoutUrl)
      .then(() => {
        toast({
          title: "Link copiado",
          description: "Link de checkout rápido copiado para a área de transferência",
        });
      })
      .catch(err => {
        console.error('Erro ao copiar link:', err);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o link",
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
    return <p className="text-center py-4">Carregando produtos...</p>;
  }

  if (error) {
    return <p className="text-center py-4 text-red-600">Erro ao carregar produtos: {error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-center py-4 text-gray-500">Nenhum produto cadastrado</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Imagem</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
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
                  {product.isDigital ? 'Digital' : 'Físico'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCheckoutLink(product.id)}
                    title="Copiar link de checkout rápido"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCheckoutLink(product.id)}
                    title="Abrir checkout rápido"
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
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
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
