
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PaymentResult, CustomerData } from '@/types/payment';
import { processPixPayment } from '@/utils/payment/paymentProcessor';
import { AsaasSettings } from '@/types/asaas';
import { DeviceType } from '@/types/order';
import { logger } from '@/utils/logger';

export interface UsePixPaymentProps {
  onSubmit: (data: PaymentResult) => Promise<any>;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
  customerData?: CustomerData;
  settings: AsaasSettings;
}

export function usePixPayment({
  onSubmit,
  isSandbox,
  isDigitalProduct = false,
  customerData,
  settings
}: UsePixPaymentProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PaymentResult | null>(null);
  
  // Detect device type for analytics
  const isMobileDevice = typeof window !== 'undefined' ? 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : 
    false;
  
  const deviceType: DeviceType = isMobileDevice ? 'mobile' : 'desktop';
  
  const generatePixQrCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.log("Generating PIX QR Code", {
        isSandbox,
        isDigitalProduct,
        hasCustomerData: !!customerData
      });
      
      // Validate customer data if available
      if (customerData) {
        // Basic validation for required fields
        if (!customerData.name || !customerData.email || !customerData.cpf || !customerData.phone) {
          throw new Error('Incomplete customer information. Please fill in all required fields.');
        }
      }
      
      const result = await processPixPayment({
        customerInfo: customerData,
        productDetails: {
          isDigitalProduct
        },
        paymentSettings: {
          isSandbox
        },
        callbacks: {
          onSuccess: async (paymentResult: PaymentResult) => {
            setPixData(paymentResult);
            toast({
              title: "PIX QR Code Generated",
              description: "Scan the QR code or copy the code to make the payment",
              duration: 5000,
            });
            await onSubmit(paymentResult);
          },
          onError: (errorMessage: string) => {
            setError(errorMessage);
            toast({
              title: "Error Generating PIX",
              description: errorMessage,
              variant: "destructive",
              duration: 5000,
            });
          },
          onSubmitting: setIsLoading
        },
        deviceInfo: {
          deviceType
        }
      });
      
      return result;
    } catch (error) {
      logger.error("Error generating PIX QR Code:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Could not generate PIX code. Please try again.";
      
      setError(errorMessage);
      
      toast({
        title: "Error Generating PIX",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, isSandbox, isDigitalProduct, customerData, toast, deviceType]);
  
  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "PIX Code Copied!",
          description: "Paste the code in your banking app to make the payment",
          duration: 3000,
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy the code. Try selecting and copying manually.",
          variant: "destructive",
          duration: 3000,
        });
      });
  }, [toast]);
  
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
}
