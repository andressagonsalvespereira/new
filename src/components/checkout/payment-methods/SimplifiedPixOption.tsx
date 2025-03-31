
import React from 'react';
import { QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';

interface SimplifiedPixOptionProps {
  onSubmit: () => void;
  isProcessing?: boolean;
  productData?: {
    productId: string;
    productName: string;
    productPrice: number;
  };
  customerData?: any;
}

const SimplifiedPixOption: React.FC<SimplifiedPixOptionProps> = ({ 
  onSubmit, 
  isProcessing = false,
  productData,
  customerData
}) => {
  const navigate = useNavigate();
  const { customization } = useCheckoutCustomization();
  
  const handlePixSubmit = () => {
    console.log("Iniciando processamento PIX com dados:", { productData, customerData });
    
    // Primeiro registra o pedido
    onSubmit();
    
    // Em seguida, redireciona para a tela de pagamento PIX
    setTimeout(() => {
      navigate('/pix-payment-manual', { 
        state: { 
          orderData: {
            productId: productData?.productId,
            productName: productData?.productName,
            productPrice: productData?.productPrice,
            paymentMethod: 'PIX'
          },
          customerData
        } 
      });
    }, 500);
  };

  // Get button styles from customization
  const buttonStyle = {
    backgroundColor: customization?.button_color || '#4caf50',
    color: customization?.button_text_color || '#ffffff'
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-lg font-medium mb-2">Pague com PIX</h3>
      <p className="text-sm text-gray-600 mb-6">
        Escaneie o QR Code abaixo com o app do seu banco ou copie o código PIX
      </p>
      
      <Button
        onClick={handlePixSubmit}
        disabled={isProcessing}
        className="w-full"
        style={buttonStyle}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <QrCode className="h-5 w-5 mr-2" />
            {customization?.button_text || "Finalizar com PIX"}
          </>
        )}
      </Button>
      
      <div className="mt-4 text-xs text-blue-600 p-3 bg-blue-50 rounded-md">
        O pagamento via PIX é instantâneo. Após o pagamento, você receberá a confirmação em seu e-mail.
      </div>
    </div>
  );
};

export default SimplifiedPixOption;
