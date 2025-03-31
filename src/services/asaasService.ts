import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

export interface AsaasSettings {
  isEnabled: boolean;
  apiKey: string;
  allowPix: boolean;
  allowCreditCard: boolean;
  manualCreditCard: boolean;
  sandboxMode: boolean;
}

const DEFAULT_SETTINGS: AsaasSettings = {
  isEnabled: false,
  apiKey: '',
  allowPix: true,
  allowCreditCard: true,
  manualCreditCard: false,
  sandboxMode: true
};

// Obtém as configurações do Asaas do Supabase
export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao obter configurações do Asaas:', error);
      return DEFAULT_SETTINGS;
    }
    
    return {
      isEnabled: data.asaas_enabled || false,
      apiKey: '', // A API key deve ser armazenada em uma variável de ambiente no backend
      allowPix: data.allow_pix || true,
      allowCreditCard: data.allow_credit_card || true,
      manualCreditCard: data.manual_credit_card || false,
      sandboxMode: data.sandbox_mode || true
    };
  } catch (error) {
    console.error('Erro ao obter configurações do Asaas:', error);
    return DEFAULT_SETTINGS;
  }
};

// Salva as configurações do Asaas no Supabase
export const saveAsaasSettings = async (settings: Partial<AsaasSettings>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('settings')
      .update({
        asaas_enabled: settings.isEnabled,
        sandbox_mode: settings.sandboxMode,
        allow_pix: settings.allowPix,
        allow_credit_card: settings.allowCreditCard,
        manual_credit_card: settings.manualCreditCard
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar configurações do Asaas:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações do Asaas:', error);
    return false;
  }
};

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

// Asaas service to handle API calls
class AsaasService {
  private getSandboxUrl() {
    return 'https://sandbox.asaas.com/api/v3';
  }

  private getProductionUrl() {
    return 'https://www.asaas.com/api/v3';
  }

  private getApiKey(isSandbox: boolean) {
    // In a real implementation, these would be environment variables or securely stored
    return isSandbox 
      ? 'SANDBOX_API_KEY' // Replace with actual sandbox key from environment
      : 'PRODUCTION_API_KEY'; // Replace with actual production key from environment
  }

  private getBaseUrl(isSandbox: boolean) {
    return isSandbox ? this.getSandboxUrl() : this.getProductionUrl();
  }

  private getHeaders(isSandbox: boolean) {
    return {
      'Content-Type': 'application/json',
      'access_token': this.getApiKey(isSandbox),
    };
  }

  // Create a customer in Asaas
  async createCustomer(customer: AsaasCustomer, isSandbox: boolean): Promise<any> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl(isSandbox)}/customers`,
        customer,
        { headers: this.getHeaders(isSandbox) }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Create a payment in Asaas
  async createPayment(payment: AsaasPayment, isSandbox: boolean): Promise<AsaasPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl(isSandbox)}/payments`,
        payment,
        { headers: this.getHeaders(isSandbox) }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Get the PIX QR code for a payment
  async getPixQrCode(paymentId: string, isSandbox: boolean): Promise<AsaasPixQrCodeResponse> {
    try {
      const response = await axios.get(
        `${this.getBaseUrl(isSandbox)}/payments/${paymentId}/pixQrCode`,
        { headers: this.getHeaders(isSandbox) }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting PIX QR code:', error);
      throw error;
    }
  }

  // Check the payment status
  async checkPaymentStatus(paymentId: string, isSandbox: boolean): Promise<AsaasPaymentResponse> {
    try {
      const response = await axios.get(
        `${this.getBaseUrl(isSandbox)}/payments/${paymentId}`,
        { headers: this.getHeaders(isSandbox) }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}

export default new AsaasService();
