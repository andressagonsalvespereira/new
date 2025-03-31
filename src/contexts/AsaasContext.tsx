
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AsaasSettings, AsaasContextType } from '@/types/asaas';
import { getAsaasSettings, saveAsaasSettings } from '@/services/asaasService';

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
    // Load settings from database service
    const loadSettings = async () => {
      try {
        const loadedSettings = await getAsaasSettings();
        console.log('Configurações carregadas:', loadedSettings);
        setSettings(loadedSettings);
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
      console.log('Salvando configurações:', newSettings);
      
      // Save settings using database service
      await saveAsaasSettings(newSettings);
      
      // Update local state
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
