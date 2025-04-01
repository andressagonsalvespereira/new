
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAsaas } from '@/contexts/AsaasContext';
import { simulatePixQrCodeGeneration } from '@/components/checkout/payment/shared/paymentSimulator';
import { PaymentResult } from '@/components/checkout/payment/shared/types';
import { CustomerData } from '@/components/checkout/payment/shared/types';

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
      console.log("Generating PIX QR code with settings:", { 
        isSandbox, 
        isDigitalProduct,
        hasCustomerData: !!customerData
      });
      
      const pixResult = await simulatePixQrCodeGeneration();
      
      // Prepare payment result
      const paymentResult: PaymentResult = {
        success: true,
        method: 'pix',
        paymentId: pixResult.paymentId,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
        qrCode: pixResult.qrCode,
        qrCodeImage: pixResult.qrCodeImage,
        expirationDate: pixResult.expirationDate
      };
      
      // Call onSubmit with the generated PIX data
      await onSubmit(paymentResult);
      
      // Store PIX data for display
      setPixData({
        qrCode: pixResult.qrCode,
        qrCodeImage: pixResult.qrCodeImage,
        expirationDate: pixResult.expirationDate,
        paymentId: pixResult.paymentId
      });
      
      toast({
        title: "QR Code PIX gerado com sucesso",
        description: "Escaneie o QR code ou copie o código para realizar o pagamento",
      });
    } catch (error) {
      console.error("Erro ao gerar QR Code PIX:", error);
      setError("Não foi possível gerar o código PIX. Por favor, tente novamente.");
      
      toast({
        title: "Erro ao gerar PIX",
        description: "Não foi possível gerar o código PIX. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, isSandbox, isDigitalProduct, customerData, toast]);
  
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
  
  // Auto-generate PIX on mount
  useCallback(() => {
    generatePixQrCode();
  }, [generatePixQrCode]);
  
  return {
    isLoading,
    error,
    pixData,
    generatePixQrCode,
    handleCopyToClipboard
  };
};
