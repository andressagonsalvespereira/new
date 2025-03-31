
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
    // Carrega as configurações do localStorage na montagem
    const loadSettings = () => {
      try {
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
      // Em uma implementação real, isso chamaria uma API para salvar as configurações
      // Por enquanto, salva no localStorage
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
