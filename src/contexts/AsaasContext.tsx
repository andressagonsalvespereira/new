
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export interface AsaasSettings {
  isEnabled: boolean;
  isSandbox: boolean;
  allowPix: boolean;
  allowCreditCard: boolean;
}

interface AsaasContextType {
  settings: AsaasSettings;
  loading: boolean;
  error: string | null;
  saveSettings: (newSettings: AsaasSettings) => Promise<void>;
}

const defaultSettings: AsaasSettings = {
  isEnabled: false,
  isSandbox: true,
  allowPix: true,
  allowCreditCard: true,
};

const AsaasContext = createContext<AsaasContextType | undefined>(undefined);

export const AsaasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AsaasSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be a call to your backend
      // For demo purposes, we're simulating the API call
      // const response = await axios.get('/api/settings');
      // setSettings(response.data);
      
      // Simulated API response
      setTimeout(() => {
        setSettings(defaultSettings);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching Asaas settings:', err);
      setError('Failed to load payment settings');
      toast({
        title: "Error",
        description: "Failed to load payment settings",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AsaasSettings) => {
    setLoading(true);
    try {
      // In a real implementation, this would be a call to your backend
      // await axios.post('/api/settings', newSettings);
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(newSettings);
      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      });
    } catch (err) {
      console.error('Error saving Asaas settings:', err);
      setError('Failed to save payment settings');
      toast({
        title: "Error",
        description: "Failed to save payment settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AsaasContext.Provider value={{ settings, loading, error, saveSettings }}>
      {children}
    </AsaasContext.Provider>
  );
};

export const useAsaas = () => {
  const context = useContext(AsaasContext);
  if (context === undefined) {
    throw new Error('useAsaas must be used within an AsaasProvider');
  }
  return context;
};
