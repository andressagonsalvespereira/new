
import { AsaasSettings } from '@/types/asaas';
import { supabase } from '@/integrations/supabase/client';

// LocalStorage keys para fallback
const ASAAS_SETTINGS_KEY = 'asaasSettings';
const ASAAS_CONFIG_KEY = 'asaasConfig';
const ASAAS_PAYMENTS_KEY = 'asaasPayments';

// Default settings
const defaultSettings: AsaasSettings = {
  isEnabled: false,
  apiKey: '',
  allowPix: true,
  allowCreditCard: true,
  manualCreditCard: false,
  sandboxMode: true,
  sandboxApiKey: '',
  productionApiKey: '',
  manualCardProcessing: false,
  manualPixPage: false,
  manualPaymentConfig: false,
  manualCardStatus: 'ANALYSIS'
};

// Get Asaas settings from Supabase or localStorage
export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    // Tenta buscar do Supabase primeiro
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações do Supabase:', settingsError);
    }

    // Busca as chaves de API do Asaas
    const { data: asaasConfigData, error: asaasConfigError } = await supabase
      .from('asaas_config')
      .select('*')
      .limit(1)
      .single();

    if (asaasConfigError && asaasConfigError.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações de API do Asaas:', asaasConfigError);
    }

    // Se encontrou dados no Supabase, use-os
    if (settingsData) {
      const combined: AsaasSettings = {
        isEnabled: settingsData.asaas_enabled || false,
        apiKey: '',
        allowPix: settingsData.allow_pix || true,
        allowCreditCard: settingsData.allow_credit_card || true,
        manualCreditCard: settingsData.manual_credit_card || false,
        sandboxMode: settingsData.sandbox_mode || true,
        sandboxApiKey: asaasConfigData?.sandbox_api_key || '',
        productionApiKey: asaasConfigData?.production_api_key || '',
        manualCardProcessing: false,
        manualPixPage: false,
        manualPaymentConfig: false,
        manualCardStatus: 'ANALYSIS'
      };

      // Define a chave da API com base no modo sandbox
      combined.apiKey = combined.sandboxMode
        ? combined.sandboxApiKey
        : combined.productionApiKey;

      return combined;
    }

    // Fallback para localStorage se Supabase falhar
    const savedSettings = localStorage.getItem(ASAAS_SETTINGS_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading Asaas settings:', error);
    return defaultSettings;
  }
};

// Save Asaas settings to Supabase and localStorage
export const saveAsaasSettings = async (settings: AsaasSettings): Promise<void> => {
  try {
    // Salva no Supabase
    const { error: settingsError } = await supabase
      .from('settings')
      .update({
        asaas_enabled: settings.isEnabled,
        allow_pix: settings.allowPix,
        allow_credit_card: settings.allowCreditCard,
        manual_credit_card: settings.manualCreditCard,
        sandbox_mode: settings.sandboxMode
      })
      .eq('id', 1);

    if (settingsError) {
      console.error('Erro ao salvar configurações no Supabase:', settingsError);
    }

    // Salva as chaves de API
    const { error: apiKeysError } = await supabase
      .from('asaas_config')
      .update({
        sandbox_api_key: settings.sandboxApiKey,
        production_api_key: settings.productionApiKey
      })
      .eq('id', 1);

    if (apiKeysError) {
      console.error('Erro ao salvar chaves de API no Supabase:', apiKeysError);
    }

    // Também salva no localStorage como backup
    localStorage.setItem(ASAAS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving Asaas settings:', error);
    // Salva no localStorage como fallback
    localStorage.setItem(ASAAS_SETTINGS_KEY, JSON.stringify(settings));
    throw error;
  }
};

// Get Asaas config (API keys) from Supabase or localStorage
export const getAsaasConfig = async () => {
  try {
    // Tenta buscar do Supabase primeiro
    const { data, error } = await supabase
      .from('asaas_config')
      .select('sandbox_api_key, production_api_key')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações de API do Asaas:', error);
    }

    if (data) {
      return { 
        sandboxApiKey: data.sandbox_api_key || '', 
        productionApiKey: data.production_api_key || '' 
      };
    }

    // Fallback para localStorage
    const savedConfig = localStorage.getItem(ASAAS_CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return { sandboxApiKey: '', productionApiKey: '' };
  } catch (error) {
    console.error('Error loading Asaas config:', error);
    return { sandboxApiKey: '', productionApiKey: '' };
  }
};

// Save Asaas config (API keys) to Supabase and localStorage
export const saveAsaasConfig = async (sandboxApiKey: string, productionApiKey: string): Promise<void> => {
  try {
    // Salva no Supabase
    const { error } = await supabase
      .from('asaas_config')
      .update({
        sandbox_api_key: sandboxApiKey,
        production_api_key: productionApiKey
      })
      .eq('id', 1);

    if (error) {
      console.error('Erro ao salvar chaves de API no Supabase:', error);
    }

    // Também salva no localStorage como backup
    localStorage.setItem(ASAAS_CONFIG_KEY, JSON.stringify({ sandboxApiKey, productionApiKey }));
  } catch (error) {
    console.error('Error saving Asaas config:', error);
    // Salva no localStorage como fallback
    localStorage.setItem(ASAAS_CONFIG_KEY, JSON.stringify({ sandboxApiKey, productionApiKey }));
    throw error;
  }
};

// Os métodos abaixo continuam utilizando localStorage para pagamentos
// Em uma implementação real, eles também deveriam usar o Supabase

// Get Asaas payments from localStorage
export const getAsaasPayments = () => {
  try {
    const savedPayments = localStorage.getItem(ASAAS_PAYMENTS_KEY);
    if (savedPayments) {
      return JSON.parse(savedPayments);
    }
    return [];
  } catch (error) {
    console.error('Error loading Asaas payments:', error);
    return [];
  }
};

// Save an Asaas payment to localStorage
export const saveAsaasPayment = (payment: any): void => {
  try {
    const payments = getAsaasPayments();
    payments.push(payment);
    localStorage.setItem(ASAAS_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error('Error saving Asaas payment:', error);
    throw error;
  }
};

// Update an Asaas payment status in localStorage
export const updateAsaasPaymentStatus = (paymentId: string, status: string): void => {
  try {
    const payments = getAsaasPayments();
    const updatedPayments = payments.map((payment: any) => {
      if (payment.payment_id === paymentId) {
        return { ...payment, status };
      }
      return payment;
    });
    localStorage.setItem(ASAAS_PAYMENTS_KEY, JSON.stringify(updatedPayments));
  } catch (error) {
    console.error('Error updating Asaas payment status:', error);
    throw error;
  }
};
