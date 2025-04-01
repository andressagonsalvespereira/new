
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPixPayment } from '@/components/checkout/payment/pix/pixProcessor';
import { PaymentResult } from '@/components/checkout/payment/shared/types';
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

export const usePixPayment = ({ 
  onSubmit, 
  isSandbox, 
  isDigitalProduct = false, 
  customerData 
}: UsePixPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixPaymentSent, setPixPaymentSent] = useState(false);

  // Add function to handle copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Código copiado",
          description: "O código PIX foi copiado para a área de transferência",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error("Erro ao copiar para área de transferência:", err);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código. Por favor, copie manualmente.",
          variant: "destructive",
          duration: 5000,
        });
      });
  };

  // Validate customer data
  const validateCustomerData = () => {
    if (!customerData) {
      return "Informações do cliente não fornecidas";
    }
    
    if (!customerData.name || customerData.name.trim().length < 3) {
      console.error("Validação PIX falhou: Nome inválido", customerData.name);
      return "Nome completo é obrigatório (mínimo 3 caracteres)";
    }
    
    if (!customerData.email || !customerData.email.includes('@')) {
      console.error("Validação PIX falhou: Email inválido", customerData.email);
      return "E-mail inválido";
    }
    
    const cpf = customerData.cpf ? customerData.cpf.replace(/\D/g, '') : '';
    if (!cpf || cpf.length !== 11) {
      console.error("Validação PIX falhou: CPF inválido", customerData.cpf);
      return "CPF inválido";
    }
    
    const phone = customerData.phone ? customerData.phone.replace(/\D/g, '') : '';
    if (!phone || phone.length < 10) {
      console.error("Validação PIX falhou: Telefone inválido", customerData.phone);
      return "Telefone inválido";
    }
    
    return null;
  };

  // Generate PIX QR Code
  useEffect(() => {
    const generatePixQrCode = async () => {
      if (!pixData && !error) {
        setIsLoading(true);
        
        try {
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
          
          console.log("Dados do cliente validados com sucesso para PIX:", {
            name: customerData.name,
            email: customerData.email,
            cpf: customerData.cpf ? customerData.cpf.substring(0, 3) + '...' : null,
            phone: customerData.phone ? customerData.phone.substring(0, 5) + '...' : null
          });
          
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
              console.error("Erro ao processar PIX:", errorMessage);
              setError(errorMessage);
              toast({
                title: "Erro no processamento",
                description: errorMessage,
                variant: "destructive",
                duration: 5000,
              });
            }
          );
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao gerar PIX";
          console.error("Exceção ao processar PIX:", err);
          setError(errorMessage);
          toast({
            title: "Erro no processamento",
            description: errorMessage,
            variant: "destructive",
            duration: 5000,
          });
        } finally {
          setIsLoading(false);
        }
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
          
          toast({
            title: "QR Code PIX gerado",
            description: "Utilize o QR code para finalizar o pagamento",
            duration: 5000,
          });
        } catch (error) {
          console.error("Error submitting PIX payment:", error);
          setError("Erro ao finalizar pagamento PIX. O QR Code foi gerado, mas houve um problema ao registrar o pedido.");
          
          toast({
            title: "Erro no registro do pedido",
            description: "O QR Code foi gerado, mas houve um problema ao registrar o pedido. Por favor, entre em contato com o suporte.",
            variant: "destructive",
            duration: 5000,
          });
        }
      };
      
      submitPixPayment();
    }
  }, [pixData, onSubmit, pixPaymentSent, isDigitalProduct, toast]);

  return {
    isLoading,
    error,
    pixData,
    handleCopyToClipboard
  };
};
