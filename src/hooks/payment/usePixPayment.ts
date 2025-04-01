
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAsaas } from '@/contexts/AsaasContext';
import { processPixPayment } from '@/components/checkout/payment/pix/pixProcessor';
import { PaymentResult, CustomerData } from '@/components/checkout/payment/shared/types';
import { logger } from '@/utils/logger';

interface UsePixPaymentProps {
  onSubmit: (data: PaymentResult) => Promise<any>;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
  customerData?: CustomerData;
}

interface PixData {
  qrCode: string;
  qrCodeImage: string;
  expirationDate: string;
  paymentId: string;
}

export const usePixPayment = ({
  onSubmit,
  isSandbox,
  isDigitalProduct = false,
  customerData
}: UsePixPaymentProps) => {
  const { toast } = useToast();
  const { settings } = useAsaas();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  
  const generatePixQrCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!settings) {
        throw new Error("Configurações de pagamento não disponíveis");
      }
      
      logger.log("Gerando QR Code PIX", { 
        isSandbox, 
        isDigitalProduct,
        hasCustomerData: !!customerData
      });
      
      await processPixPayment(
        {
          formState: { 
            customerInfo: customerData,
            isDigitalProduct
          },
          settings,
          isSandbox,
          onSubmit
        },
        (paymentResult: PaymentResult) => {
          // Store PIX data for display
          if (paymentResult.qrCode && paymentResult.qrCodeImage && paymentResult.expirationDate) {
            setPixData({
              qrCode: paymentResult.qrCode,
              qrCodeImage: paymentResult.qrCodeImage,
              expirationDate: paymentResult.expirationDate,
              paymentId: paymentResult.paymentId || `pix_${Date.now()}`
            });
            
            toast({
              title: "QR Code PIX gerado com sucesso",
              description: "Escaneie o QR code ou copie o código para realizar o pagamento",
            });
          } else {
            throw new Error("Dados de PIX incompletos retornados");
          }
        },
        (errorMessage: string) => {
          setError(errorMessage);
          toast({
            title: "Erro ao gerar PIX",
            description: errorMessage,
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      logger.error("Erro ao gerar QR Code PIX:", error);
      setError("Não foi possível gerar o código PIX. Por favor, tente novamente.");
      
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, isSandbox, isDigitalProduct, customerData, toast, settings]);
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Código PIX copiado!",
          description: "Cole o código no seu app do banco para fazer o pagamento",
        });
      })
      .catch(() => {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código. Tente selecionar e copiar manualmente.",
          variant: "destructive",
        });
      });
  };
  
  // Auto-generate PIX on hook initialization if needed
  useEffect(() => {
    if (!pixData && !error && !isLoading && customerData) {
      generatePixQrCode();
    }
  }, [pixData, error, isLoading, customerData, generatePixQrCode]);
  
  return {
    isLoading,
    error,
    pixData,
    generatePixQrCode,
    handleCopyToClipboard
  };
};
