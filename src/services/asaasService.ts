
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

export interface AsaasConfig {
  sandboxApiKey: string | null;
  productionApiKey: string | null;
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
    // Obter as configurações gerais
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
    
    if (settingsError) {
      console.error('Erro ao obter configurações do Asaas:', settingsError);
      return DEFAULT_SETTINGS;
    }
    
    // Obter as chaves de API
    const { data: configData, error: configError } = await supabase
      .from('asaas_config')
      .select('*')
      .limit(1)
      .single();
    
    let apiKey = '';
    if (!configError && configData) {
      apiKey = settingsData.sandbox_mode 
        ? configData.sandbox_api_key || '' 
        : configData.production_api_key || '';
    }
    
    return {
      isEnabled: settingsData.asaas_enabled || false,
      apiKey,
      allowPix: settingsData.allow_pix || true,
      allowCreditCard: settingsData.allow_credit_card || true,
      manualCreditCard: settingsData.manual_credit_card || false,
      sandboxMode: settingsData.sandbox_mode || true
    };
  } catch (error) {
    console.error('Erro ao obter configurações do Asaas:', error);
    return DEFAULT_SETTINGS;
  }
};

// Obtém as chaves de API do Asaas do Supabase
export const getAsaasConfig = async (): Promise<AsaasConfig> => {
  try {
    const { data, error } = await supabase
      .from('asaas_config')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao obter chaves de API do Asaas:', error);
      return { sandboxApiKey: null, productionApiKey: null };
    }
    
    return {
      sandboxApiKey: data.sandbox_api_key,
      productionApiKey: data.production_api_key
    };
  } catch (error) {
    console.error('Erro ao obter chaves de API do Asaas:', error);
    return { sandboxApiKey: null, productionApiKey: null };
  }
};

// Salva as chaves de API do Asaas no Supabase
export const saveAsaasConfig = async (config: AsaasConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('asaas_config')
      .update({
        sandbox_api_key: config.sandboxApiKey,
        production_api_key: config.productionApiKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Erro ao salvar chaves de API do Asaas:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar chaves de API do Asaas:', error);
    return false;
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

// Interfaces para integração com a API Asaas
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

// Salvar dados de pagamento no Supabase
export const saveAsaasPayment = async (
  orderId: number, 
  paymentId: string, 
  method: 'PIX' | 'CREDIT_CARD', 
  status: string,
  qrCode?: string,
  qrCodeImage?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('asaas_payments')
      .insert({
        order_id: orderId,
        payment_id: paymentId,
        method,
        status,
        qr_code: qrCode,
        qr_code_image: qrCodeImage
      });
    
    if (error) {
      console.error('Erro ao salvar dados de pagamento Asaas:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados de pagamento Asaas:', error);
    return false;
  }
};

// Atualizar status do pagamento no Supabase
export const updateAsaasPaymentStatus = async (
  paymentId: string, 
  status: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('asaas_payments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);
    
    if (error) {
      console.error('Erro ao atualizar status do pagamento Asaas:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento Asaas:', error);
    return false;
  }
};

// Asaas service to handle API calls
class AsaasService {
  private getSandboxUrl() {
    return 'https://sandbox.asaas.com/api/v3';
  }

  private getProductionUrl() {
    return 'https://www.asaas.com/api/v3';
  }

  private async getApiKey(isSandbox: boolean) {
    const config = await getAsaasConfig();
    return isSandbox 
      ? config.sandboxApiKey || '' 
      : config.productionApiKey || '';
  }

  private getBaseUrl(isSandbox: boolean) {
    return isSandbox ? this.getSandboxUrl() : this.getProductionUrl();
  }

  private async getHeaders(isSandbox: boolean) {
    const apiKey = await this.getApiKey(isSandbox);
    return {
      'Content-Type': 'application/json',
      'access_token': apiKey,
    };
  }

  // Create a customer in Asaas
  async createCustomer(customer: AsaasCustomer, isSandbox: boolean): Promise<any> {
    try {
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.post(
        `${this.getBaseUrl(isSandbox)}/customers`,
        customer,
        { headers }
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
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.post(
        `${this.getBaseUrl(isSandbox)}/payments`,
        payment,
        { headers }
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
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.get(
        `${this.getBaseUrl(isSandbox)}/payments/${paymentId}/pixQrCode`,
        { headers }
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
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.get(
        `${this.getBaseUrl(isSandbox)}/payments/${paymentId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}

export default new AsaasService();
