
import React, { useState } from 'react';
import { QrCode, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const validateCustomerData = () => {
    if (!customerData) {
      return "Informações do cliente não fornecidas";
    }
    
    if (!customerData.name || customerData.name.trim().length < 3) {
      return "Nome completo é obrigatório (mínimo 3 caracteres)";
    }
    
    if (!customerData.email || !customerData.email.includes('@')) {
      return "E-mail inválido";
    }
    
    const cpf = customerData.cpf ? customerData.cpf.replace(/\D/g, '') : '';
    if (!cpf || cpf.length !== 11) {
      return "CPF inválido";
    }
    
    const phone = customerData.phone ? customerData.phone.replace(/\D/g, '') : '';
    if (!phone || phone.length < 10) {
      return "Telefone inválido";
    }
    
    return null;
  };
  
  const handlePixSubmit = () => {
    console.log("Validando dados do cliente para PIX:", customerData);
    
    const error = validateCustomerData();
    if (error) {
      setValidationError(error);
      return;
    }
    
    setValidationError(null);
    console.log("Dados validados, iniciando processamento PIX");
    
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
