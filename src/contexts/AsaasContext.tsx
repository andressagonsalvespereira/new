
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AsaasSettings, AsaasContextType } from '@/types/asaas';
import { supabase } from '@/integrations/supabase/client';

const defaultSettings: AsaasSettings = {
  isEnabled: true,
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

const AsaasContext = createContext<AsaasContextType>({
  settings: defaultSettings,
  loading: true,
  saveSettings: () => Promise.resolve(),
  updateSettings: () => Promise.resolve(),
});

export const useAsaas = () => useContext(AsaasContext);

type AsaasProviderProps = {
  children: React.ReactNode;
};

export const AsaasProvider: React.FC<AsaasProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AsaasSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega as configurações do Supabase ou localStorage na montagem
    const loadSettings = async () => {
      try {
        // Tenta buscar as configurações do Supabase primeiro
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

        // Se encontrou dados no Supabase, use-os, caso contrário, tente o localStorage
        if (settingsData) {
          const combinedSettings: AsaasSettings = {
            isEnabled: settingsData.asaas_enabled || false,
            apiKey: '',
            allowPix: settingsData.allow_pix || true,
            allowCreditCard: settingsData.allow_credit_card || true,
            manualCreditCard: settingsData.manual_credit_card || false,
            sandboxMode: settingsData.sandbox_mode || true,
            sandboxApiKey: asaasConfigData?.sandbox_api_key || '',
            productionApiKey: asaasConfigData?.production_api_key || '',
            manualCardProcessing: settings.manualCardProcessing || false,
            manualCardStatus: settings.manualCardStatus || 'ANALYSIS',
            manualPixPage: settings.manualPixPage || false,
            manualPaymentConfig: settings.manualPaymentConfig || false,
          };

          // Define a chave da API com base no modo sandbox
          combinedSettings.apiKey = combinedSettings.sandboxMode
            ? combinedSettings.sandboxApiKey
            : combinedSettings.productionApiKey;

          setSettings(combinedSettings);
        } else {
          // Se não encontrar no Supabase, tenta o localStorage
          const savedSettings = localStorage.getItem('asaasSettings');
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Garante que todas as propriedades existam nas configurações salvas
            setSettings({
              ...defaultSettings, // Usa os valores padrão como base
              ...parsedSettings,   // Sobrescreve com os valores salvos
              // Garante que apiKey seja definida
              apiKey: parsedSettings.apiKey || '',
              manualCardStatus: parsedSettings.manualCardStatus || defaultSettings.manualCardStatus,
            });
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar configurações do Asaas:', error);
        setSettings(defaultSettings);
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: AsaasSettings) => {
    try {
      // Garante que apiKey sempre está presente
      const settingsToSave = {
        ...newSettings,
        apiKey: newSettings.apiKey || '',
        manualCardStatus: newSettings.manualCardStatus || defaultSettings.manualCardStatus
      };
      
      // Salva no Supabase
      const { error: settingsError } = await supabase
        .from('settings')
        .update({
          asaas_enabled: settingsToSave.isEnabled,
          allow_pix: settingsToSave.allowPix,
          allow_credit_card: settingsToSave.allowCreditCard,
          manual_credit_card: settingsToSave.manualCreditCard,
          sandbox_mode: settingsToSave.sandboxMode
        })
        .eq('id', 1);

      if (settingsError) {
        console.error('Erro ao salvar configurações no Supabase:', settingsError);
        throw new Error(settingsError.message);
      }

      // Salva as chaves de API
      const { error: apiKeysError } = await supabase
        .from('asaas_config')
        .update({
          sandbox_api_key: settingsToSave.sandboxApiKey,
          production_api_key: settingsToSave.productionApiKey
        })
        .eq('id', 1);

      if (apiKeysError) {
        console.error('Erro ao salvar chaves de API no Supabase:', apiKeysError);
        throw new Error(apiKeysError.message);
      }

      // Também salva no localStorage como backup
      localStorage.setItem('asaasSettings', JSON.stringify(settingsToSave));
      setSettings(settingsToSave);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do Asaas foram atualizadas com sucesso.",
        duration: 3000,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao salvar configurações do Asaas:', error);
      
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações do Asaas.",
        variant: "destructive",
        duration: 5000,
      });
      
      return Promise.reject(error);
    }
  };

  const updateSettings = saveSettings; // Alias para updateSettings

  return (
    <AsaasContext.Provider
      value={{
        settings,
        loading,
        saveSettings,
        updateSettings,
      }}
    >
      {children}
    </AsaasContext.Provider>
  );
};

export default AsaasProvider;
