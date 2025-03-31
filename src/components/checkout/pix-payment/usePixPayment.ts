
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPixPayment } from '../utils/payment/pixProcessor';
import { PaymentResult } from '../utils/payment/types';

interface UsePixPaymentProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
}

interface PixData {
  qrCode: string;
  qrCodeImage: string;
  expirationDate: string;
  paymentId: string;
}

export const usePixPayment = ({ onSubmit, isSandbox }: UsePixPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixPaymentSent, setPixPaymentSent] = useState(false);

  // Generate PIX QR Code
  useEffect(() => {
    const generatePixQrCode = async () => {
      if (!pixData) {
        setIsLoading(true);
        
        // Process PIX payment
        await processPixPayment(
          {
            formState: {}, // formState not used in simulated PIX processing
            settings: {
              isEnabled: true,
              apiKey: '',
              allowPix: true,
              allowCreditCard: true,
              manualCreditCard: false,
              sandboxMode: isSandbox
            },
            isSandbox,
            onSubmit: (data) => {
              // Store data temporarily but don't submit yet
              console.log("PIX data generated:", data);
            }
          },
          (paymentData: PaymentResult) => {
            // Extract PIX data from result
            setPixData({
              qrCode: paymentData.qrCode as string,
              qrCodeImage: paymentData.qrCodeImage as string,
              expirationDate: paymentData.expirationDate as string,
              paymentId: paymentData.paymentId
            });
          },
          (errorMessage: string) => {
            setError(errorMessage);
            toast({
              title: "Erro no processamento",
              description: errorMessage,
              variant: "destructive",
              duration: 5000,
            });
          }
        );
        
        setIsLoading(false);
      }
    };
    
    generatePixQrCode();
  }, [isSandbox, onSubmit, toast, pixData]);

  // Submit the PIX data to create the order when data is ready
  useEffect(() => {
    if (pixData && !pixPaymentSent) {
      const submitPixPayment = async () => {
        try {
          console.log("Submitting PIX payment data to create order:", pixData);
          await onSubmit({
            paymentId: pixData.paymentId,
            qrCode: pixData.qrCode,
            qrCodeImage: pixData.qrCodeImage,
            expirationDate: pixData.expirationDate,
            status: 'PENDING'
          });
          setPixPaymentSent(true);
          console.log("PIX payment successfully submitted");
        } catch (error) {
          console.error("Error submitting PIX payment:", error);
          setError("Erro ao finalizar pagamento PIX. O QR Code foi gerado, mas houve um problema ao registrar o pedido.");
        }
      };
      
      submitPixPayment();
    }
  }, [pixData, onSubmit, pixPaymentSent]);

  return {
    isLoading,
    error,
    pixData
  };
};
