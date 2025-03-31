
// Arquivo mantido para compatibilidade com versões anteriores
// Reexporta os processadores de pagamento do novo sistema

import { processCardPayment } from './payment/cardProcessor';
import { processPixPayment } from './payment/pixProcessor';
import { PaymentProcessorProps } from './payment/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AsaasSettings } from '@/types/asaas';

// Reexportar a função de processamento de cartão para manter compatibilidade
export { processCardPayment };

// Exportar types para manter compatibilidade
export type { PaymentProcessorProps };

// Exportar função de processamento PIX para uso futuro
export { processPixPayment };

// Interface para valores do formulário
export interface FormValues {
  personalInfo: any;
  productId: string;
  productName: string;
  productPrice: number;
  cardData?: any;
}

// Processa pagamento
export const processPayment = async (
  formValues: FormValues,
  paymentMethod: 'card' | 'pix',
  settings: AsaasSettings | null
) => {
  // This is a legacy function kept for compatibility
  // The implementation has been moved to specialized processors
  // This stub is kept to prevent breaking changes
  console.warn('processPayment is deprecated. Use specialized processors instead.');
  
  if (!settings) {
    console.error("Settings not available");
    return { success: false, error: 'Configurações de pagamento não disponíveis' };
  }
  
  return { success: false, error: 'Método de pagamento não implementado' };
};
