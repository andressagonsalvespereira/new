
export interface AsaasSettings {
  isEnabled: boolean;
  apiKey: string;
  allowPix: boolean;
  allowCreditCard: boolean;
  manualCreditCard: boolean;
  sandboxMode: boolean;
  sandboxApiKey: string;
  productionApiKey: string;
  manualCardProcessing: boolean;
  manualPixPage: boolean;
  manualPaymentConfig: boolean;
  manualCardStatus: 'APPROVED' | 'DENIED' | 'ANALYSIS';
}

export interface AsaasContextType {
  settings: AsaasSettings;
  loading: boolean;
  saveSettings: (settings: AsaasSettings) => Promise<void>;
  updateSettings: (settings: AsaasSettings) => Promise<void>;
}

// Customer types
export interface AsaasCustomer {
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

// Payment types
export interface AsaasPayment {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
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
  };
  creditCardToken?: string;
  remoteIp?: string;
}

export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  value: number;
  netValue: number;
  status: string;
  billingType: string;
  dueDate: string;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  externalReference?: string;
  pixQrCodeId?: string;
  canBePaidAfterDueDate?: boolean;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
  success?: boolean;
  id?: string;
}
