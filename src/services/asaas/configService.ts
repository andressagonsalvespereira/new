
import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves Asaas configuration from the legacy config table
 * @returns Promise with Asaas configuration object
 */
export const getAsaasConfig = async (): Promise<{
  sandboxApiKey: string;
  productionApiKey: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('asaas_config')
      .select('*')
      .single();

    if (error) throw error;

    return {
      sandboxApiKey: data.sandbox_api_key || '',
      productionApiKey: data.production_api_key || ''
    };
  } catch (error) {
    console.error('Error fetching Asaas config:', error);
    return {
      sandboxApiKey: '',
      productionApiKey: ''
    };
  }
};

/**
 * Saves Asaas configuration to the legacy config table
 * @param config Asaas configuration to save
 * @returns Promise that resolves when config is saved
 */
export const saveAsaasConfig = async (config: {
  sandboxApiKey: string;
  productionApiKey: string;
}): Promise<void> => {
  try {
    const { error } = await supabase
      .from('asaas_config')
      .upsert({
        sandbox_api_key: config.sandboxApiKey,
        production_api_key: config.productionApiKey,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving Asaas config:', error);
    throw error;
  }
};
