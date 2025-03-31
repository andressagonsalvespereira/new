
import { AsaasSettings } from '@/types/asaas';

export interface PaymentProcessorProps {
  formState: any;
  settings: AsaasSettings;
  isSandbox: boolean;
  onSubmit: (data: any) => void;
}

export interface PaymentResult {
  success: boolean;
  method: 'card' | 'pix';
  paymentId?: string;
  error?: string;
  status: string;
  timestamp: string;
  [key: string]: any;
}
