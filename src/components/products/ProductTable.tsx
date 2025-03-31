
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
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <p className="text-center text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-red-600 font-medium mb-4">Erro ao carregar produtos: {error}</p>
          <p className="text-gray-600 mb-4">Verifique sua conexão com a internet e tente novamente.</p>
          <Button 
            variant="default" 
            onClick={retryFetchProducts}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          {isOffline && (
            <p className="mt-4 text-sm text-amber-600">
              Modo offline ativo. Alguns produtos podem estar indisponíveis ou desatualizados.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
        <p className="text-sm text-gray-400">Clique em "Adicionar Produto" para começar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      {isOffline && (
        <div className="bg-amber-50 p-3 border-b text-sm text-amber-800">
          <p className="flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
            Modo offline: Os dados podem estar desatualizados. Alterações serão salvas localmente.
          </p>
        </div>
      )}
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
