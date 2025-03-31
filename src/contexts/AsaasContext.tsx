
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type AsaasSettings = {
  isEnabled: boolean;
  isSandbox: boolean;
  allowPix: boolean;
  allowCreditCard: boolean;
  manualCardProcessing: boolean; // Added new setting
};

const defaultSettings: AsaasSettings = {
  isEnabled: true,
  isSandbox: true,
  allowPix: true,
  allowCreditCard: true,
  manualCardProcessing: false, // Default is disabled
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
            manualCardProcessing: parsedSettings.manualCardProcessing !== undefined 
              ? parsedSettings.manualCardProcessing 
              : defaultSettings.manualCardProcessing
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
