
import { AsaasSettings } from '@/types/asaas';
import { supabase } from '@/integrations/supabase/client';

// LocalStorage keys for fallback
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

// Normalize card status to one of the valid enum values
export const normalizeCardStatus = (status: string | null | undefined): 'APPROVED' | 'DENIED' | 'ANALYSIS' => {
  if (status === 'APPROVED') return 'APPROVED';
  if (status === 'DENIED') return 'DENIED';
  return 'ANALYSIS'; // Default value
};

// Get Asaas settings from Supabase or localStorage
export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    // Try to fetch from Supabase first
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações do Supabase:', settingsError);
    }

    // Fetch Asaas API keys
    const { data: asaasConfigData, error: asaasConfigError } = await supabase
      .from('asaas_config')
      .select('*')
      .limit(1)
      .single();

    if (asaasConfigError && asaasConfigError.code !== 'PGRST116') {
      console.error('Erro ao buscar configurações de API do Asaas:', asaasConfigError);
    }

    // If found data in Supabase, use it
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
        manualCardProcessing: settingsData.manual_card_processing || false,
        manualPixPage: settingsData.manual_pix_page || false,
        manualPaymentConfig: settingsData.manual_payment_config || false,
        manualCardStatus: normalizeCardStatus(settingsData.manual_card_status)
      };

      // Set API key based on sandbox mode
      combined.apiKey = combined.sandboxMode
        ? combined.sandboxApiKey || ''
        : combined.productionApiKey || '';

      return combined;
    }

    // Fallback to localStorage if Supabase fails
    const savedSettings = localStorage.getItem(ASAAS_SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        ...defaultSettings,
        ...parsed,
        manualCardStatus: normalizeCardStatus(parsed.manualCardStatus)
      };
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
    // Ensure cardStatus is normalized
    const normalizedSettings = {
      ...settings,
      manualCardStatus: normalizeCardStatus(settings.manualCardStatus)
    };
    
    // Save to Supabase
    const { error: settingsError } = await supabase
      .from('settings')
      .update({
        asaas_enabled: normalizedSettings.isEnabled,
        allow_pix: normalizedSettings.allowPix,
        allow_credit_card: normalizedSettings.allowCreditCard,
        manual_credit_card: normalizedSettings.manualCreditCard,
        sandbox_mode: normalizedSettings.sandboxMode,
        manual_card_status: normalizedSettings.manualCardStatus,
        manual_card_processing: normalizedSettings.manualCardProcessing,
        manual_pix_page: normalizedSettings.manualPixPage,
        manual_payment_config: normalizedSettings.manualPaymentConfig
      })
      .eq('id', 1);

    if (settingsError) {
      console.error('Erro ao salvar configurações no Supabase:', settingsError);
      throw settingsError;
    }

    // Save API keys
    const { error: apiKeysError } = await supabase
      .from('asaas_config')
      .update({
        sandbox_api_key: normalizedSettings.sandboxApiKey,
        production_api_key: normalizedSettings.productionApiKey
      })
      .eq('id', 1);

    if (apiKeysError) {
      console.error('Erro ao salvar chaves de API no Supabase:', apiKeysError);
      throw apiKeysError;
    }

    // Also save to localStorage as backup
    localStorage.setItem(ASAAS_SETTINGS_KEY, JSON.stringify(normalizedSettings));
  } catch (error) {
    console.error('Error saving Asaas settings:', error);
    // Save to localStorage as fallback
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
