
import { supabase } from '@/integrations/supabase/client';
import { AsaasSettings } from '@/types/asaas';

export const getAsaasSettings = async (): Promise<AsaasSettings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) throw error;

    return {
      isEnabled: data.asaas_enabled ?? false,
      apiKey: data.sandbox_mode ? data.sandbox_api_key || '' : data.production_api_key || '',
      allowPix: data.allow_pix ?? true,
      allowCreditCard: data.allow_credit_card ?? true,
      manualCreditCard: data.manual_credit_card ?? false,
      sandboxMode: data.sandbox_mode ?? true,
      sandboxApiKey: data.sandbox_api_key || '',
      productionApiKey: data.production_api_key || '',
      manualCardProcessing: data.manual_card_processing ?? false,
      manualPixPage: data.manual_pix_page ?? false,
      manualPaymentConfig: data.manual_payment_config ?? false,
      manualCardStatus: data.manual_card_status || 'ANALYSIS'
    };
  } catch (error) {
    console.error('Error fetching Asaas settings:', error);
    throw error;
  }
};

export const saveAsaasSettings = async (settings: AsaasSettings): Promise<void> => {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({
        asaas_enabled: settings.isEnabled,
        allow_pix: settings.allowPix,
        allow_credit_card: settings.allowCreditCard,
        manual_credit_card: settings.manualCreditCard,
        sandbox_mode: settings.sandboxMode,
        sandbox_api_key: settings.sandboxApiKey,
        production_api_key: settings.productionApiKey,
        manual_card_processing: settings.manualCardProcessing,
        manual_pix_page: settings.manualPixPage,
        manual_payment_config: settings.manualPaymentConfig,
        manual_card_status: settings.manualCardStatus
      }, { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving Asaas settings:', error);
    throw error;
  }
};
