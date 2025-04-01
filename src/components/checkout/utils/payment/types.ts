
import { AsaasSettings } from '@/types/asaas';

export interface PaymentProcessorProps {
  formState: any;
  settings: AsaasSettings;
  isSandbox: boolean;
  onSubmit: (data: any) => void;
}

export interface CustomerData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
  };
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
