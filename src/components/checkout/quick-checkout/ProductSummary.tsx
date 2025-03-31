
import React from 'react';
import { Product } from '@/types/product';

interface ProductSummaryProps {
  product: Product;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ product }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <h3 className="font-semibold mb-2">{product.nome}</h3>
        <p className="text-sm text-gray-600">{product.descricao}</p>
      </div>
      <div className="text-right font-bold text-lg">
        R$ {product.preco ? product.preco.toFixed(2) : '0.00'}
      </div>
    </div>
  );
};

export default ProductSummary;
