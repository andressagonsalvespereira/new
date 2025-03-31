
import React from 'react';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';
import { usePixPayment } from './pix-payment/usePixPayment';
import PixQrCode from './pix-payment/PixQrCode';
import PixCopyCode from './pix-payment/PixCopyCode';
import PixInformation from './pix-payment/PixInformation';
import LoadingState from './pix-payment/LoadingState';
import ErrorState from './pix-payment/ErrorState';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';

interface PixPaymentProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
}

const PixPayment = ({ onSubmit, isSandbox, isDigitalProduct = false }: PixPaymentProps) => {
  // Get customer data from checkout form
  const { formState } = useCheckoutForm();
  
  // Extract customer data
  const customerData = {
    name: formState.fullName,
    email: formState.email,
    cpf: formState.cpf,
    phone: formState.phone
  };
  
  // Use our custom hook for PIX payment logic
  const { isLoading, error, pixData } = usePixPayment({ 
    onSubmit, 
    isSandbox,
    isDigitalProduct,
    customerData
  });
  
  // Get customization for button styling
  const { customization } = useCheckoutCustomization();

  // Get button styles from customization
  const buttonStyle = {
    backgroundColor: customization?.button_color || '#4caf50',
    color: customization?.button_text_color || '#ffffff'
  };

  // Render loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState errorMessage={error} />;
  }

  // If no PIX data available yet, return nothing
  if (!pixData) {
    return null;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-center">
        <h3 className="font-medium mb-2">Pague com PIX</h3>
        <p className="text-sm text-gray-600">
          Escaneie o QR Code abaixo com o app do seu banco ou copie o código PIX
        </p>
      </div>

      {/* QR Code Component */}
      <PixQrCode qrCodeImage={pixData.qrCodeImage} />

      {/* Copy Code Component */}
      <PixCopyCode 
        pixCode={pixData.qrCode} 
        buttonStyle={buttonStyle}
        buttonText={customization?.button_text || "Copiar Código PIX"}
      />

      {/* Information Component */}
      <PixInformation />
    </div>
  );
};

export default PixPayment;
