
import { AsaasSettings } from '@/types/asaas';
import { DeviceType } from '@/types/order';

export interface PaymentProcessorProps {
  formState: any;
  settings: AsaasSettings;
  isSandbox: boolean;
  onSubmit: (data: PaymentResult) => Promise<any> | any;
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
  // Card-specific fields
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  brand?: string;
  deviceType?: DeviceType;
  // PIX-specific fields
  qrCode?: string;
  qrCodeImage?: string;
  expirationDate?: string;
  [key: string]: any;
}

// Interface for checkout form state
export interface CheckoutFormState {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  selectedShipping: string;
  deliveryEstimate: string;
  formErrors: Record<string, string>;
}

// Interface for product details in the checkout
export interface ProductCheckoutDetails {
  id: string;
  name: string;
  price: number;
  isDigital: boolean;
}
