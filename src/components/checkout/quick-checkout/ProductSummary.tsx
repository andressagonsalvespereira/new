
import React from 'react';

interface ProductSummaryProps {
  product: {
    name: string;
    description: string;
    price: number;
  };
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ product }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-1">
        <h3 className="font-semibold mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
      </div>
      <div className="text-right font-bold text-lg">
        R$ {product.price.toFixed(2)}
      </div>
    </div>
  );
};

export default ProductSummary;
