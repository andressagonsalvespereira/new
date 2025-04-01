
import { useState, useEffect } from 'react';
import { PaymentStatus } from '@/types/order';
import { AsaasSettings } from '@/types/asaas';

export interface UseCardPaymentStatusProps {
  isSandbox: boolean;
  useCustomProcessing?: boolean;
  manualCardStatus?: string;
  settings: AsaasSettings;
}

export function useCardPaymentStatus({ 
  isSandbox, 
  useCustomProcessing = false,
  manualCardStatus = 'ANALYSIS',
  settings
}: UseCardPaymentStatusProps) {
  const [status, setStatus] = useState<PaymentStatus>('Pendente');
  const [statusMessage, setStatusMessage] = useState('Processando pagamento...');
  const [confirmed, setConfirmed] = useState(false);

  // Handle custom card processing logic if enabled
  useEffect(() => {
    if (useCustomProcessing) {
      const customStatus = manualCardStatus || 'ANALYSIS';
      
      switch (customStatus.toUpperCase()) {
        case 'APPROVED':
          setStatus('Pago');
          setStatusMessage('Pagamento aprovado!');
          setConfirmed(true);
          break;
        case 'DECLINED':
          setStatus('Cancelado');
          setStatusMessage('Pagamento recusado pela operadora.');
          setConfirmed(false);
          break;
        case 'ANALYSIS':
        default:
          setStatus('Pendente');
          setStatusMessage('Pagamento em análise.');
          setConfirmed(false);
          break;
      }
    }
  }, [useCustomProcessing, manualCardStatus]);

  return {
    status,
    statusMessage,
    confirmed
  };
}
