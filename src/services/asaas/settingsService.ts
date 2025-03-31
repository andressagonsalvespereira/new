
import { supabase } from '@/integrations/supabase/client';
import { AsaasSettings } from '@/types/asaas';

/**
 * Retrieves Asaas settings from the database
 * @returns Promise with AsaasSettings object
 */
export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    // First, query the settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (settingsError) throw settingsError;

    // Then, query the asaas_config table for API keys
    const { data: configData, error: configError } = await supabase
      .from('asaas_config')
      .select('*')
      .single();

    if (configError && configError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - this is OK if there's no config yet
      console.warn('No Asaas config found, using defaults for API keys');
    }

    return {
      isEnabled: settingsData.asaas_enabled ?? false,
      apiKey: settingsData.sandbox_mode ? 
        (configData?.sandbox_api_key || '') : (configData?.production_api_key || ''),
      allowPix: settingsData.allow_pix ?? true,
      allowCreditCard: settingsData.allow_credit_card ?? true,
      manualCreditCard: settingsData.manual_credit_card ?? false,
      sandboxMode: settingsData.sandbox_mode ?? true,
      sandboxApiKey: configData?.sandbox_api_key || '',
      productionApiKey: configData?.production_api_key || '',
      manualCardProcessing: settingsData.manual_card_processing ?? false,
      manualPixPage: settingsData.manual_pix_page ?? false,
      manualPaymentConfig: settingsData.manual_payment_config ?? false,
      manualCardStatus: (settingsData.manual_card_status as 'APPROVED' | 'DENIED' | 'ANALYSIS') || 'ANALYSIS'
    };
  } catch (error) {
    console.error('Error fetching Asaas settings:', error);
    throw error;
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
