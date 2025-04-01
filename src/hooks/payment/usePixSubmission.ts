
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { processPixPayment } from '@/components/checkout/payment/pix/pixProcessor';
import { PaymentResult } from '@/components/checkout/payment/shared/types';
import { CustomerData } from '@/components/checkout/payment/shared/types';

interface UsePixSubmissionProps {
  customerData?: CustomerData;
  productId?: string;
  productName?: string;
  productPrice?: number;
  isDigitalProduct?: boolean;
  isSandbox?: boolean;
  onSubmitSuccess?: (result: PaymentResult) => void;
  redirectToSuccess?: boolean;
}

export const usePixSubmission = ({
  customerData,
  productId,
  productName,
  productPrice,
  isDigitalProduct = false,
  isSandbox = true,
  onSubmitSuccess,
  redirectToSuccess = true
}: UsePixSubmissionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PaymentResult | null>(null);
  
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const formState = {
        customerInfo: customerData,
        productId,
        productName,
        productPrice,
        isDigitalProduct
      };
      
      await processPixPayment(
        {
          formState,
          settings: {
            isEnabled: true,
            allowPix: true,
            sandboxMode: isSandbox
          },
          isSandbox,
          onSubmit: (data: PaymentResult) => {
            setPixData(data);
            
            if (onSubmitSuccess) {
              onSubmitSuccess(data);
            }
            
            if (redirectToSuccess) {
              navigate('/payment-success', { 
                state: { 
                  paymentId: data.paymentId,
                  method: 'pix',
                  productName 
                } 
              });
            }
            
            return Promise.resolve(data);
          }
        },
        (pixResult: PaymentResult) => {
          setPixData(pixResult);
          
          toast({
            title: "QR Code PIX gerado com sucesso",
            description: "Escaneie o QR code ou copie o código para realizar o pagamento",
          });
        },
        (errMsg: string) => {
          setError(errMsg);
          
          toast({
            title: "Erro ao gerar PIX",
            description: errMsg,
            variant: "destructive",
          });
        }
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao gerar QR Code PIX';
      setError(errMsg);
      
      toast({
        title: "Erro ao gerar PIX",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [customerData, productId, productName, productPrice, isDigitalProduct, isSandbox, onSubmitSuccess, redirectToSuccess, navigate, toast]);
  
  return {
    loading,
    error,
    pixData,
    handleSubmit
  };
};
