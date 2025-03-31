
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AsaasSettings, AsaasContextType } from '@/types/asaas';

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
    // Load settings from localStorage on mount
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('asaasSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Ensure the manualCardProcessing property exists in saved settings
          setSettings({
            ...parsedSettings,
            manualCreditCard: parsedSettings.manualCreditCard !== undefined 
              ? parsedSettings.manualCreditCard 
              : defaultSettings.manualCreditCard,
            manualCardProcessing: parsedSettings.manualCardProcessing !== undefined
              ? parsedSettings.manualCardProcessing
              : defaultSettings.manualCardProcessing,
            manualPixPage: parsedSettings.manualPixPage !== undefined
              ? parsedSettings.manualPixPage
              : defaultSettings.manualPixPage,
            manualPaymentConfig: parsedSettings.manualPaymentConfig !== undefined
              ? parsedSettings.manualPaymentConfig
              : defaultSettings.manualPaymentConfig,
            manualCardStatus: parsedSettings.manualCardStatus !== undefined
              ? parsedSettings.manualCardStatus
              : defaultSettings.manualCardStatus,
            // Ensure apiKey is defined
            apiKey: parsedSettings.apiKey || ''
          });
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
      // In a real implementation, this would call an API to save settings
      // For now, save to localStorage
      localStorage.setItem('asaasSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
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

  const updateSettings = saveSettings; // Alias for updateSettings

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
