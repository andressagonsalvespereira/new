
export interface AsaasSettings {
  isEnabled: boolean;
  apiKey?: string;
  allowCreditCard: boolean;
  allowPix: boolean;
  manualCreditCard: boolean;
  sandboxMode: boolean;
  sandboxApiKey?: string;
  productionApiKey?: string;
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

export interface AsaasApiResponse {
  id?: string;
  status?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  dueDate?: string;
  value?: number;
  netValue?: number;
  billingType?: string;
  canBePaidAfterDueDate?: boolean;
  description?: string;
  externalReference?: string;
  paymentDate?: string;
  clientId?: string;
  subscription?: string;
  installment?: string;
  creditCard?: AsaasCreditCard;
  fine?: AsaasFine;
  interest?: AsaasInterest;
  deleted?: boolean;
  postalService?: boolean;
  anticipated?: boolean;
  dateCreated?: string;
  lastInvoiceViewedDate?: string;
  lastBankSlipViewedDate?: string;
  pixQrCodeImage?: string;
  pixKey?: string;
  pixCopiaECola?: string;
  confirmedDate?: string;
  paymentLink?: string;
  hidden?: boolean;
  originalValue?: number;
  interestValue?: number;
  originalDueDate?: string;
  paymentMethods?: string[];
  error?: string;
  errors?: AsaasError[];
}

export interface AsaasPaymentResponse extends AsaasApiResponse {
  id: string;
  status: string;
  value: number;
  netValue: number;
  customer: string;
  billingType: string;
  dueDate: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasError {
  code?: string;
  description?: string;
  field?: string;
}

export interface AsaasFine {
  value?: number;
  type?: string;
}

export interface AsaasInterest {
  value?: number;
  type?: string;
}

export interface AsaasCreditCard {
  creditCardNumber?: string;
  creditCardBrand?: string;
  creditCardToken?: string;
}

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  cpfCnpj: string;
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
  groupName?: string;
  company?: string;
  dateCreated?: string;
}

export interface AsaasConfig {
  id?: number;
  sandbox_api_key?: string;
  production_api_key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AsaasPayment {
  id?: number;
  order_id?: number;
  payment_id: string;
  method?: string;
  status?: string;
  qr_code?: string;
  qr_code_image?: string;
  created_at?: string;
  updated_at?: string;
  value?: number;
  customer?: string;
  billingType?: string;
  dueDate?: string;
}
