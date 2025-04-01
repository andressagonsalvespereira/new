
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, ArrowLeft, RefreshCw } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';

interface ProductNotFoundProps {
  slug?: string;
}

const ProductNotFound: React.FC<ProductNotFoundProps> = ({ slug }) => {
  const navigate = useNavigate();
  const { products, retryFetchProducts, isOffline } = useProducts();
  
  const handleRetryFetch = async () => {
    await retryFetchProducts();
    // Tenta carregar a página novamente após atualizar os produtos
    window.location.reload();
  };
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Produto não encontrado</h2>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            {slug 
              ? `O produto com o identificador "${slug}" não existe ou foi removido.`
              : 'O produto que você está procurando não existe ou foi removido.'
            }
          </p>
          
          {isOffline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <p className="font-medium">Você está no modo offline</p>
              <p>Pode ser que o produto exista mas não esteja disponível localmente.</p>
            </div>
          )}
          
          {products && products.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Produtos disponíveis: {products.length}</p>
              <ul className="text-xs text-left mt-1 border border-gray-100 rounded p-2 bg-gray-50 max-h-32 overflow-y-auto">
                {products.map((p) => (
                  <li key={p.id} className="mb-1 hover:bg-gray-100 p-1 rounded">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600 text-xs"
                      onClick={() => navigate(`/quick-checkout/${p.slug}`)}
                    >
                      {p.nome}
                    </Button>
                    <span className="text-gray-500 text-xs ml-1">({p.slug})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-gray-600 text-sm">
            Possíveis razões:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>O URL pode estar incorreto</li>
            <li>O produto pode ter sido excluído</li>
            <li>O produto pode ter sido renomeado, alterando seu link</li>
          </ul>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleRetryFetch}
            className="bg-amber-600 hover:bg-amber-700 w-full flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar e tentar novamente
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 w-full flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a página inicial
          </Button>
          
          <Button 
            onClick={() => navigate('/admin/products')}
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Ver todos os produtos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductNotFound;
