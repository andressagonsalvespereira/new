
import React, { useState, useRef } from 'react';
import { QrCode, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const { customization } = useCheckoutCustomization();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [wasClicked, setWasClicked] = useState(false);
  // Use a ref to prevent parallel processing
  const isSubmittingRef = useRef(false);
  
  const validateCustomerData = () => {
    if (!customerData) {
      console.error("PIX: customerData is null or undefined");
      return "Informações do cliente não fornecidas";
    }
    
    if (!customerData.name || customerData.name.trim().length < 3) {
      console.error("PIX validation failed: Invalid name", customerData.name);
      return "Nome completo é obrigatório (mínimo 3 caracteres)";
    }
    
    if (!customerData.email || !customerData.email.includes('@')) {
      console.error("PIX validation failed: Invalid email", customerData.email);
      return "E-mail inválido";
    }
    
    const cpf = customerData.cpf ? customerData.cpf.replace(/\D/g, '') : '';
    if (!cpf || cpf.length !== 11) {
      console.error("PIX validation failed: Invalid CPF", customerData.cpf);
      return "CPF inválido";
    }
    
    const phone = customerData.phone ? customerData.phone.replace(/\D/g, '') : '';
    if (!phone || phone.length < 10) {
      console.error("PIX validation failed: Invalid phone", customerData.phone);
      return "Telefone inválido";
    }
    
    console.log("PIX: Customer data validation passed", {
      name: customerData.name,
      email: customerData.email,
      cpf: cpf.substring(0, 3) + '...',
      phone: phone.substring(0, 3) + '...'
    });
    
    return null;
  };
  
  const handlePixSubmit = () => {
    // Prevent parallel processing and multiple clicks
    if (isProcessing || wasClicked || isSubmittingRef.current) {
      console.log("PIX button already clicked or processing in progress, ignoring click");
      return;
    }
    
    // Set both state and ref to track submission
    setWasClicked(true);
    isSubmittingRef.current = true;
    
    console.log("PIX button clicked, validating customer data:", {
      customerName: customerData?.name,
      customerEmail: customerData?.email,
      productName: productData?.productName,
      productPrice: productData?.productPrice
    });
    
    const error = validateCustomerData();
    if (error) {
      setValidationError(error);
      toast({
        title: "Erro de validação",
        description: error,
        variant: "destructive",
      });
      
      // Reset submission flags after error
      setTimeout(() => {
        setWasClicked(false);
        isSubmittingRef.current = false;
      }, 2000);
      return;
    }
    
    setValidationError(null);
    console.log("PIX: Data validated, initiating order processing");
    
    try {
      // First register the order
      console.log("PIX: Calling onSubmit to register order");
      onSubmit();
      
      // Then redirect to the PIX payment screen
      setTimeout(() => {
        console.log("PIX: Redirecting to PIX payment page with:", {
          productId: productData?.productId,
          productName: productData?.productName,
          customerName: customerData?.name
        });
        
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
    } catch (error) {
      console.error("PIX: Error processing payment:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar o pagamento PIX. Tente novamente.",
        variant: "destructive",
      });
      
      // Reset submission flags after error
      setTimeout(() => {
        setWasClicked(false);
        isSubmittingRef.current = false;
      }, 2000);
    }
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
