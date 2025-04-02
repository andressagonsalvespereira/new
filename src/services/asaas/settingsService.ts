import { supabase } from '@/integrations/supabase/client';
import { AsaasSettings } from '@/types/asaas';

/**
 * Retrieves Asaas settings from the database
 * @returns Promise with AsaasSettings object
 */
export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    // First, query the settings table - now handling multiple rows by taking the first one
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (settingsError) throw settingsError;
    
    // If no settings data found, return default values
    if (!settingsData || settingsData.length === 0) {
      console.warn('No settings found, using defaults');
      return {
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
    }

    // Use the first (most recently updated) settings row
    const settings = settingsData[0];

    // Then, query the asaas_config table for API keys
    const { data: configData, error: configError } = await supabase
      .from('asaas_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (configError && configError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - this is OK if there's no config yet
      console.warn('No Asaas config found, using defaults for API keys');
    }

    return {
      isEnabled: settings.asaas_enabled ?? false,
      apiKey: settings.sandbox_mode ? 
        (configData?.[0]?.sandbox_api_key || '') : (configData?.[0]?.production_api_key || ''),
      allowPix: settings.allow_pix ?? true,
      allowCreditCard: settings.allow_credit_card ?? true,
      manualCreditCard: settings.manual_credit_card ?? false,
      sandboxMode: settings.sandbox_mode ?? true,
      sandboxApiKey: configData?.[0]?.sandbox_api_key || '',
      productionApiKey: configData?.[0]?.production_api_key || '',
      manualCardProcessing: settings.manual_card_processing ?? false,
      manualPixPage: settings.manual_pix_page ?? false,
      manualPaymentConfig: settings.manual_payment_config ?? false,
      manualCardStatus: (settings.manual_card_status as 'APPROVED' | 'DENIED' | 'ANALYSIS') || 'ANALYSIS'
    };
  } catch (error) {
    console.error('Error fetching Asaas settings:', error);
    // Return default settings in case of error
    return {
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
  }
};

/**
 * Saves Asaas settings to the database
 * @param settings AsaasSettings object to save
 * @returns Promise that resolves when settings are saved
 */
export const saveAsaasSettings = async (settings: AsaasSettings): Promise<void> => {
  try {
    // First, save the settings
    const { error: settingsError } = await supabase
      .from('settings')
      .upsert({
        asaas_enabled: settings.isEnabled,
        allow_pix: settings.allowPix,
        allow_credit_card: settings.allowCreditCard,
        manual_credit_card: settings.manualCreditCard,
        sandbox_mode: settings.sandboxMode,
        manual_card_processing: settings.manualCardProcessing,
        manual_pix_page: settings.manualPixPage,
        manual_payment_config: settings.manualPaymentConfig,
        manual_card_status: settings.manualCardStatus
      }, { onConflict: 'id' });

    if (settingsError) throw settingsError;

    // Then, save the API keys in the asaas_config table
    const { error: configError } = await supabase
      .from('asaas_config')
      .upsert({
        sandbox_api_key: settings.sandboxApiKey,
        production_api_key: settings.productionApiKey,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (configError) throw configError;
  } catch (error) {
    console.error('Error saving Asaas settings:', error);
    throw error;
  }
};
