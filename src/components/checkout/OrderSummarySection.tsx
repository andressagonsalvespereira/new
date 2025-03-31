
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductDetailsType {
  name: string;
  price: number;
  description: string;
  image: string;
}

interface OrderSummarySectionProps {
  productDetails: ProductDetailsType;
  handlePayment: () => void;
  isProcessing: boolean;
}

const OrderSummarySection = ({ productDetails, handlePayment, isProcessing }: OrderSummarySectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">4</div>
        <h2 className="font-medium">Sua Compra</h2>
        <div className="ml-auto text-sm font-medium">Total: <span className="text-red-600">R$ {productDetails.price.toFixed(2)}</span></div>
      </div>
      
      <div className="px-2">
        <div className="border rounded-md p-4 mb-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-100 rounded mr-4 overflow-hidden">
              <img src={productDetails.image} alt={productDetails.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{productDetails.name}</h3>
              <p className="text-sm text-gray-600">{productDetails.description}</p>
              <p className="text-red-600 font-bold">R$ {productDetails.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handlePayment} 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-md"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processando...' : 'Finalizar agora'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">Pagamentos 100% seguros, todos os cartões aceitos</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummarySection;
