
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
import { usePixPayment } from './pix-payment/usePixPayment';
import { PaymentResult } from './payment/shared/types';

interface PixPaymentProps {
  onSubmit: (data: any) => Promise<any>;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
}

const PixPayment: React.FC<PixPaymentProps> = ({ 
  onSubmit, 
  isSandbox,
  isDigitalProduct = false
}) => {
  const { toast } = useToast();
  const { settings } = useAsaas();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PaymentResult | null>(null);
  
  const { handleCopyToClipboard } = usePixPayment();
  
  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await processPixPayment(
        {
          formState: { isDigitalProduct },
          settings,
          isSandbox,
          onSubmit
        },
        (data) => {
          setPixData(data);
          console.log("PIX payment processed successfully:", data);
        },
        (errorMsg) => {
          setError(errorMsg);
          toast({
            title: "Erro ao processar PIX",
            description: errorMsg,
            variant: "destructive",
            duration: 5000,
          });
        }
      );
    } catch (err) {
      console.error("Error in PixPayment component:", err);
      setError("Ocorreu um erro ao processar o pagamento PIX. Por favor, tente novamente.");
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar o pagamento PIX. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If we're still loading
  if (loading) {
    return <LoadingState />;
  }
  
  // If we encountered an error
  if (error) {
    return <ErrorState message={error} retryAction={handleProcessPayment} />;
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
          disabled={loading}
        >
          {loading ? (
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
      <PixQrCode imageUrl={pixData.qrCodeImage} />
      <PixCopyCode 
        pixCode={pixData.qrCode} 
        onCopy={() => handleCopyToClipboard(pixData.qrCode)} 
      />
      <PixInformation expiration={pixData.expirationDate} isDigital={isDigitalProduct} />
    </div>
  );
};

export default PixPayment;
