
import { supabase } from '@/integrations/supabase/client';
import { AsaasSettings } from '@/types/asaas';

const DEFAULT_SETTINGS: AsaasSettings = {
  isEnabled: false,
  apiKey: '',
  allowPix: true,
  allowCreditCard: true,
  manualCreditCard: false,
  sandboxMode: true
};

/**
 * Gets the Asaas configuration from the database
 */
export const getAsaasConfig = async (): Promise<{
  sandboxApiKey: string | null;
  productionApiKey: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('asaas_config')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching Asaas API keys:', error);
      return { sandboxApiKey: null, productionApiKey: null };
    }
    
    return {
      sandboxApiKey: data.sandbox_api_key,
      productionApiKey: data.production_api_key
    };
  } catch (error) {
    console.error('Error fetching Asaas API keys:', error);
    return { sandboxApiKey: null, productionApiKey: null };
  }
};

/**
 * Gets the Asaas settings from the database
 */
export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    // Get general settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
    
    if (settingsError) {
      console.error('Error fetching Asaas settings:', settingsError);
      return DEFAULT_SETTINGS;
    }
    
    // Get API keys
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
    console.error('Error fetching Asaas settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Saves the Asaas API keys to the database
 */
export const saveAsaasConfig = async (
  sandboxApiKey: string | null,
  productionApiKey: string | null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('asaas_config')
      .update({
        sandbox_api_key: sandboxApiKey,
        production_api_key: productionApiKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
    if (error) {
      console.error('Error saving Asaas API keys:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving Asaas API keys:', error);
    return false;
  }
};

/**
 * Saves the Asaas settings to the database
 */
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
      console.error('Error saving Asaas settings:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving Asaas settings:', error);
    return false;
  }
};

/**
 * Saves payment data to the database
 */
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
      console.error('Error saving Asaas payment data:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving Asaas payment data:', error);
    return false;
  }
};

/**
 * Updates the status of a payment in the database
 */
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
      console.error('Error updating Asaas payment status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating Asaas payment status:', error);
    return false;
  }
};
