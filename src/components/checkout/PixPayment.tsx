
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingState from './pix-payment/LoadingState';
import ErrorState from './pix-payment/ErrorState';
import PixQrCode from './pix-payment/PixQrCode';
import PixCopyCode from './pix-payment/PixCopyCode';
import PixInformation from './pix-payment/PixInformation';
import { processPixPayment } from './payment/pix/pixProcessor';
import { useAsaas } from '@/contexts/AsaasContext';
import { usePixPayment } from '@/hooks/payment/usePixPayment';
import { PaymentResult } from './payment/shared/types';

interface PixPaymentProps {
  onSubmit: (data: any) => Promise<any>;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
  customerData?: any;
}

interface ErrorStateProps {
  message: string;
  retryAction: () => void;
}

interface PixQrCodeProps {
  qrCodeUrl: string;
}

interface PixCopyCodeProps {
  code: string;
  onCopy: () => void;
}

interface PixInformationProps {
  expirationDate: string;
  isDigitalProduct: boolean;
}

const PixPayment: React.FC<PixPaymentProps> = ({ 
  onSubmit, 
  isSandbox,
  isDigitalProduct = false,
  customerData
}) => {
  const { toast } = useToast();
  const { settings } = useAsaas();
  
  const { 
    isLoading, 
    error, 
    pixData,
    handleCopyToClipboard
  } = usePixPayment({
    onSubmit,
    isSandbox,
    isDigitalProduct,
    customerData
  });
  
  const handleProcessPayment = async () => {
    console.log("Manual process payment triggered");
    // Esta função é apenas um placeholder para compatibilidade
    // A verdadeira lógica de processamento agora está no hook usePixPayment
  };
  
  // If we're still loading
  if (isLoading) {
    return <LoadingState />;
  }
  
  // If we encountered an error
  if (error) {
    return (
      <ErrorState 
        message={error} 
        retryAction={handleProcessPayment} 
      />
    );
  }
  
  // If we haven't generated a PIX code yet
  if (!pixData) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-center mb-6">
          Clique no botão abaixo para gerar um código PIX para pagamento.
        </p>
        <button
          onClick={handleProcessPayment}
          className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
              Gerando PIX...
            </>
          ) : (
            "Gerar Código PIX"
          )}
        </button>
      </div>
    );
  }
  
  // If we have generated a PIX code
  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      <PixQrCode 
        qrCodeUrl={pixData.qrCodeImage} 
      />
      <PixCopyCode 
        code={pixData.qrCode} 
        onCopy={() => handleCopyToClipboard(pixData.qrCode)} 
      />
      <PixInformation 
        expirationDate={pixData.expirationDate} 
        isDigitalProduct={isDigitalProduct} 
      />
    </div>
  );
};

export default PixPayment;
