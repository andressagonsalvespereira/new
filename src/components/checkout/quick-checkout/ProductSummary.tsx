
import React from 'react';
import { Product } from '@/types/product';

interface ProductSummaryProps {
  product: Product;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ product }) => {
  const nome = product.nome || '';
  const descricao = product.descricao || '';
  const preco = product.preco || 0;
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <h3 className="font-semibold mb-2">{nome}</h3>
        <p className="text-sm text-gray-600">{descricao}</p>
      </div>
      <div className="text-right font-bold text-lg">
        R$ {typeof preco === 'number' ? preco.toFixed(2) : '0.00'}
      </div>
    </div>
  );
};

export default ProductSummary;
