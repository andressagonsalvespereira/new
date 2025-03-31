import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPixPayment } from '../utils/payment/pixProcessor';
import { PaymentResult } from '../utils/payment/types';
import { AsaasSettings } from '@/types/asaas';

interface UsePixPaymentProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
  customerData?: any;
}

interface PixData {
  qrCode: string;
  qrCodeImage: string;
  expirationDate: string;
  paymentId: string;
}

export const usePixPayment = ({ onSubmit, isSandbox, isDigitalProduct = false, customerData }: UsePixPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixPaymentSent, setPixPaymentSent] = useState(false);

  // Validate customer data
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

  // Generate PIX QR Code
  useEffect(() => {
    const generatePixQrCode = async () => {
      if (!pixData && !error) {
        setIsLoading(true);
        
        // Validate customer data first
        const validationError = validateCustomerData();
        if (validationError) {
          setError(validationError);
          setIsLoading(false);
          toast({
            title: "Erro de validação",
            description: validationError,
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
        
        // Create complete settings object for the processor
        const completeSettings: AsaasSettings = {
          isEnabled: true,
          apiKey: '',
          allowPix: true,
          allowCreditCard: true,
          manualCreditCard: false,
          sandboxMode: isSandbox,
          sandboxApiKey: '',
          productionApiKey: '',
          manualCardProcessing: false,
          manualPixPage: false,
          manualPaymentConfig: false,
          manualCardStatus: 'ANALYSIS'
        };
        
        // Process PIX payment
        await processPixPayment(
          {
            formState: { 
              isDigitalProduct,
              customerInfo: customerData 
            },
            settings: completeSettings,
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
              paymentId: paymentData.paymentId as string
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
  }, [isSandbox, onSubmit, toast, pixData, error, customerData, isDigitalProduct]);

  // Submit the PIX data to create the order when data is ready
  useEffect(() => {
    if (pixData && !pixPaymentSent) {
      const submitPixPayment = async () => {
        try {
          console.log("Submitting PIX payment data to create order:", pixData);
          console.log("Is digital product:", isDigitalProduct);
          
          await onSubmit({
            paymentId: pixData.paymentId,
            qrCode: pixData.qrCode,
            qrCodeImage: pixData.qrCodeImage,
            expirationDate: pixData.expirationDate,
            status: 'PENDING',
            isDigitalProduct // Pass the digital product flag to the order creation
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
  }, [pixData, onSubmit, pixPaymentSent, isDigitalProduct]);

  return {
    isLoading,
    error,
    pixData
  };
};
