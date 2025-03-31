
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';

interface OrderSummarySectionProps {
  productDetails: ProductDetailsType;
  handlePayment: () => void;
  isProcessing: boolean;
}

interface ProductDetailsType {
  name: string;
  price: number;
  description: string;
  image: string;
  isDigital: boolean;
}

const OrderSummarySection = ({ productDetails, handlePayment, isProcessing }: OrderSummarySectionProps) => {
  const shipping = productDetails.isDigital ? 0 : 10;
  const subtotal = productDetails.price;
  const total = subtotal + shipping;

  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">4</div>
        <h2 className="font-medium text-lg">Resumo do pedido</h2>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-3">
              <img 
                src={productDetails.image} 
                alt={productDetails.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-medium">{productDetails.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{productDetails.description.substring(0, 80)}{productDetails.description.length > 80 ? '...' : ''}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-3 mb-3">
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Subtotal</span>
              <span>R${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Frete</span>
              <span>{shipping === 0 ? 'Grátis' : `R$${shipping.toFixed(2)}`}</span>
            </div>
            
            <div className="flex justify-between py-2 border-t border-gray-100 mt-2">
              <span className="text-gray-800 font-medium">Total</span>
              <span className="text-black font-bold">R${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            Finalizar Compra
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
      
      <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
        <ShoppingCart className="h-3 w-3 mr-1" />
        <span>Compra segura e protegida</span>
      </div>
    </div>
  );
};

export default OrderSummarySection;
