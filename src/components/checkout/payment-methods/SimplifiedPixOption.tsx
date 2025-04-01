
import React from 'react';
import { QrCode, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';
import { usePixSubmission } from '@/hooks/payment/usePixSubmission';

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
  isProcessing: externalProcessing = false,
  productData,
  customerData
}) => {
  const { customization } = useCheckoutCustomization();
  
  // Use the extracted Pix submission hook
  const {
    validationError,
    wasClicked,
    isProcessing: internalProcessing,
    handlePixSubmit
  } = usePixSubmission({
    customerData,
    productData,
    onSubmit
  });
  
  // Combine external and internal processing state
  const isProcessing = externalProcessing || internalProcessing;

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
      
      {validationError && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {validationError}
          </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handlePixSubmit}
        disabled={isProcessing || wasClicked}
        className="w-full"
        style={buttonStyle}
        data-testid="pix-button"
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
