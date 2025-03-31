
// Types for Asaas integration settings
export interface AsaasSettings {
  isEnabled: boolean;
  apiKey: string;
  allowPix: boolean;
  allowCreditCard: boolean;
  manualCreditCard: boolean;
  sandboxMode: boolean;
  // Fixing type errors by adding property
  manualCardProcessing?: boolean;
  // For backward compatibility
  isSandbox?: boolean;
}

// API interface types
export interface AsaasCustomer {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  city?: string;
  state?: string;
  country?: string;
}

export interface AsaasPayment {
  customer: string;
  billingType: 'PIX' | 'CREDIT_CARD';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  postalService?: boolean;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone?: string;
    mobilePhone?: string;
  };
}

export interface AsaasPaymentResponse {
  id: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  pixQrCodeUrl?: string;
  pixCopiaECola?: string;
  value: number;
  netValue?: number;
  billingType: string;
  dueDate: string;
  creditCard?: {
    creditCardBrand?: string;
  };
  errors?: any[];
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}
