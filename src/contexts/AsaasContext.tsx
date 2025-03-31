
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AsaasSettings } from '@/types/asaas';

const defaultSettings: AsaasSettings = {
  isEnabled: true,
  apiKey: '',
  allowPix: true,
  allowCreditCard: true,
  manualCreditCard: false,
  sandboxMode: true,
};

type AsaasContextType = {
  settings: AsaasSettings;
  loading: boolean;
  saveSettings: (settings: AsaasSettings) => Promise<void>;
};

const AsaasContext = createContext<AsaasContextType>({
  settings: defaultSettings,
  loading: true,
  saveSettings: () => Promise.resolve(),
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
              : defaultSettings.manualCreditCard
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading Asaas settings:', error);
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
    } catch (error) {
      console.error('Error saving Asaas settings:', error);
      
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações do Asaas.",
        variant: "destructive",
        duration: 5000,
      });
      
      throw error;
    }
  };

  return (
    <AsaasContext.Provider
      value={{
        settings,
        loading,
        saveSettings,
      }}
    >
      {children}
    </AsaasContext.Provider>
  );
};

export default AsaasProvider;
