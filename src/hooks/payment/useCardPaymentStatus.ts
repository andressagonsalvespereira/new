
import { useState } from 'react';
import { AsaasSettings } from '@/types/asaas';

interface UseCardPaymentStatusProps {
  settings?: AsaasSettings;
  useCustomProcessing?: boolean;
  manualCardStatus?: string;
}

export const useCardPaymentStatus = ({
  settings,
  useCustomProcessing = false,
  manualCardStatus
}: UseCardPaymentStatusProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  // Fallback settings for when they're not provided
  const defaultSettings: AsaasSettings = {
    isEnabled: false,
    allowCreditCard: true,
    allowPix: true,
    sandboxMode: true,
    manualCardProcessing: false,
    manualCardStatus: 'ANALYSIS'
  };

  const getButtonText = (): string => {
    if (!settings?.manualCardProcessing) {
      return "Pagar com Cartão";
    }
    
    // Choose between product-specific and global settings
    const status = useCustomProcessing && manualCardStatus 
      ? manualCardStatus 
      : settings?.manualCardStatus;
      
    switch (status) {
      case 'APPROVED':
        return "Simular Aprovação";
      case 'DENIED':
        return "Simular Reprovação";
      case 'ANALYSIS':
      default:
        return "Simular Pagamento em Análise";
    }
  };

  const getAlertMessage = (): string => {
    if (!settings?.manualCardProcessing) {
      return "";
    }
    
    // Choose between product-specific and global settings
    const status = useCustomProcessing && manualCardStatus 
      ? manualCardStatus 
      : settings?.manualCardStatus;
      
    switch (status) {
      case 'APPROVED':
        return "Este checkout está configurado para sempre aprovar pagamentos.";
      case 'DENIED':
        return "Este checkout está configurado para sempre reprovar pagamentos.";
      case 'ANALYSIS':
      default:
        return "Este checkout está configurado para colocar pagamentos em análise.";
    }
  };

  const getAlertStyles = () => {
    if (!settings?.manualCardProcessing) {
      return {
        alertClass: "bg-blue-50 border-blue-200 mb-4",
        iconClass: "text-blue-600",
        textClass: "text-blue-800"
      };
    }
    
    // Choose between product-specific and global settings
    const status = useCustomProcessing && manualCardStatus 
      ? manualCardStatus 
      : settings?.manualCardStatus;
      
    switch (status) {
      case 'APPROVED':
        return {
          alertClass: "bg-green-50 border-green-200 mb-4",
          iconClass: "text-green-600",
          textClass: "text-green-800"
        };
      case 'DENIED':
        return {
          alertClass: "bg-red-50 border-red-200 mb-4",
          iconClass: "text-red-600",
          textClass: "text-red-800"
        };
      case 'ANALYSIS':
      default:
        return {
          alertClass: "bg-yellow-50 border-yellow-200 mb-4",
          iconClass: "text-yellow-600",
          textClass: "text-yellow-800"
        };
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    paymentStatus,
    setPaymentStatus,
    getButtonText,
    getAlertMessage,
    getAlertStyles,
    settings: defaultSettings,
  };
};
