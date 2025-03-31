
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const ProductNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Produto não encontrado</h2>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            O produto que você está procurando não existe ou foi removido.
          </p>
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
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            Voltar para a página inicial
          </Button>
          
          <Button 
            onClick={() => navigate('/admin/products')}
            variant="outline"
            className="w-full"
          >
            Ver todos os produtos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductNotFound;
