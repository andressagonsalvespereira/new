
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const ProductNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Produto não encontrado</h2>
        <p className="text-gray-600 mb-4">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Voltar para a página inicial
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductNotFound;
