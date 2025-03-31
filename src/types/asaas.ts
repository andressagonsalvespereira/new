
export interface AsaasSettings {
  isEnabled: boolean;
  apiKey: string;
  allowPix: boolean;
  allowCreditCard: boolean;
  manualCreditCard: boolean;
  sandboxMode: boolean;
  sandboxApiKey?: string;
  productionApiKey?: string;
  manualCardProcessing?: boolean;
}

export interface AsaasContextType {
  settings: AsaasSettings;
  loading: boolean;
  saveSettings: (settings: AsaasSettings) => Promise<void>;
  updateSettings: (settings: AsaasSettings) => Promise<void>;
}
