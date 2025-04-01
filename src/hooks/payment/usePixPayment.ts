
import { useState, useEffect, useCallback } from 'react';
import { PaymentResult, CustomerData } from '@/types/payment';
import { AsaasSettings } from '@/types/asaas';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface PixPaymentHookProps {
  onSubmit: (data: PaymentResult) => Promise<any>;
  isSandbox: boolean;
  isDigitalProduct?: boolean;
  customerData?: CustomerData;
  settings?: AsaasSettings;
}

interface PixData {
  qrCode?: string;
  qrCodeImage?: string;
  paymentId?: string;
  expirationDate?: string;
}

export const usePixPayment = ({
  onSubmit,
  isSandbox,
  isDigitalProduct = false,
  customerData,
  settings
}: PixPaymentHookProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const { toast } = useToast();
  
  const clearError = () => {
    if (error) setError(null);
  };
  
  // Generate PIX QR code
  const generatePixQrCode = async () => {
    try {
      setIsLoading(true);
      clearError();
      
      logger.log("Generating PIX QR Code", { isSandbox, isDigitalProduct });
      
      // In a real implementation, you would call your payment processor API
      // This is just a simulation
      const response = await new Promise<PaymentResult>((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            method: 'pix',
            paymentId: `pix_${Date.now()}`,
            status: 'PENDING',
            timestamp: new Date().toISOString(),
            qrCode: "00020101021226890014br.gov.bcb.pix2567invoice-checkout.asaas.com/b/37968507FTYKJGX0J8VM52040000530398654041.005802BR5925LOJA TESTE ASAAS LTDA6009SAO PAULO62070503***6304433C",
            qrCodeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAFBlWElmTU0A",
            expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
          });
        }, 1500);
      });
      
      // Update state with PIX data
      setPixData({
        qrCode: response.qrCode,
        qrCodeImage: response.qrCodeImage,
        paymentId: response.paymentId,
        expirationDate: response.expirationDate
      });
      
      // Submit payment data to parent component
      if (onSubmit) {
        await onSubmit(response);
      }
      
      logger.log("PIX QR Code generated successfully");
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate PIX QR Code";
      logger.error("Error generating PIX QR Code:", err);
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Success",
          description: "PIX code copied to clipboard",
          duration: 3000,
        });
      })
      .catch((err) => {
        logger.error("Error copying to clipboard:", err);
        toast({
          title: "Error",
          description: "Failed to copy PIX code",
          variant: "destructive",
        });
      });
  }, [toast]);
  
  // Auto-generate PIX code on first render if in manual mode
  useEffect(() => {
    if (settings?.manualPixPage && !pixData && !isLoading) {
      generatePixQrCode().catch((err) => {
        logger.error("Auto-generation of PIX code failed:", err);
      });
    }
  }, [settings?.manualPixPage, pixData, isLoading]);
  
  return {
    isLoading,
    error,
    pixData,
    generatePixQrCode,
    handleCopyToClipboard,
    clearError
  };
};
