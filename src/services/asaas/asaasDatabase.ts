
import { AsaasSettings } from '@/types/asaas';

// LocalStorage keys
const ASAAS_SETTINGS_KEY = 'asaasSettings';
const ASAAS_CONFIG_KEY = 'asaasConfig';
const ASAAS_PAYMENTS_KEY = 'asaasPayments';

// Default settings
const defaultSettings: AsaasSettings = {
  isEnabled: false,
  apiKey: '',
  allowPix: true,
  allowCreditCard: true,
  manualCreditCard: false,
  sandboxMode: true,
  sandboxApiKey: '',
  productionApiKey: '',
  manualCardProcessing: false
};

// Get Asaas settings from localStorage
export const getAsaasSettings = (): AsaasSettings => {
  try {
    const savedSettings = localStorage.getItem(ASAAS_SETTINGS_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading Asaas settings:', error);
    return defaultSettings;
  }
};

// Save Asaas settings to localStorage
export const saveAsaasSettings = (settings: AsaasSettings): void => {
  try {
    localStorage.setItem(ASAAS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving Asaas settings:', error);
    throw error;
  }
};

// Get Asaas config (API keys) from localStorage
export const getAsaasConfig = () => {
  try {
    const savedConfig = localStorage.getItem(ASAAS_CONFIG_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return { sandboxApiKey: '', productionApiKey: '' };
  } catch (error) {
    console.error('Error loading Asaas config:', error);
    return { sandboxApiKey: '', productionApiKey: '' };
  }
};

// Save Asaas config (API keys) to localStorage
export const saveAsaasConfig = (sandboxApiKey: string, productionApiKey: string): void => {
  try {
    localStorage.setItem(ASAAS_CONFIG_KEY, JSON.stringify({ sandboxApiKey, productionApiKey }));
  } catch (error) {
    console.error('Error saving Asaas config:', error);
    throw error;
  }
};

// Get Asaas payments from localStorage
export const getAsaasPayments = () => {
  try {
    const savedPayments = localStorage.getItem(ASAAS_PAYMENTS_KEY);
    if (savedPayments) {
      return JSON.parse(savedPayments);
    }
    return [];
  } catch (error) {
    console.error('Error loading Asaas payments:', error);
    return [];
  }
};

// Save an Asaas payment to localStorage
export const saveAsaasPayment = (payment: any): void => {
  try {
    const payments = getAsaasPayments();
    payments.push(payment);
    localStorage.setItem(ASAAS_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error('Error saving Asaas payment:', error);
    throw error;
  }
};

// Update an Asaas payment status in localStorage
export const updateAsaasPaymentStatus = (paymentId: string, status: string): void => {
  try {
    const payments = getAsaasPayments();
    const updatedPayments = payments.map((payment: any) => {
      if (payment.payment_id === paymentId) {
        return { ...payment, status };
      }
      return payment;
    });
    localStorage.setItem(ASAAS_PAYMENTS_KEY, JSON.stringify(updatedPayments));
  } catch (error) {
    console.error('Error updating Asaas payment status:', error);
    throw error;
  }
};
