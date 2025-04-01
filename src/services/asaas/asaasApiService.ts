
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  AsaasSettings, 
  AsaasCustomer,
  AsaasPayment,
  AsaasPaymentResponse,
  AsaasPixQrCodeResponse
} from '@/types/asaas';

const createApiInstance = (apiKey: string, isSandbox: boolean) => {
  const baseURL = isSandbox 
    ? 'https://sandbox.asaas.com/api/v3' 
    : 'https://www.asaas.com/api/v3';
  
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey
    },
    // Add timeout to prevent the request from hanging
    timeout: 10000
  });
};

const asaasApiService = {
  createCustomer: async (settings: AsaasSettings, customerData: AsaasCustomer) => {
    try {
      if (!settings.isEnabled || !settings.apiKey) {
        console.log("Asaas is disabled or API key not set, returning mock customer");
        return { id: `cus_${uuidv4().substring(0, 8)}` };
      }
      
      const api = createApiInstance(settings.apiKey, settings.sandboxMode);
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      // Return a mock customer ID to avoid breaking the flow
      return { id: `cus_${uuidv4().substring(0, 8)}` };
    }
  },

  createPayment: async (settings: AsaasSettings, paymentData: any) => {
    try {
      if (!settings.isEnabled || !settings.apiKey) {
        console.log("Asaas is disabled or API key not set, returning mock payment");
        return {
          id: `pay_${uuidv4().substring(0, 8)}`,
          status: 'CONFIRMED',
          value: paymentData.value,
          netValue: paymentData.value,
          customer: paymentData.customer,
          billingType: paymentData.billingType,
          dueDate: paymentData.dueDate
        } as AsaasPaymentResponse;
      }
      
      const api = createApiInstance(settings.apiKey, settings.sandboxMode);
      const response = await api.post('/payments', paymentData);
      return response.data as AsaasPaymentResponse;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  getPixQrCode: async (settings: AsaasSettings, paymentId: string) => {
    try {
      if (!settings.isEnabled || !settings.apiKey) {
        console.log("Asaas is disabled or API key not set, returning mock PIX QR code");
        return {
          encodedImage: "mock-qr-code-image",
          payload: "mock-pix-payload",
          expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        } as AsaasPixQrCodeResponse;
      }
      
      const api = createApiInstance(settings.apiKey, settings.sandboxMode);
      const response = await api.get(`/payments/${paymentId}/pixQrCode`);
      return response.data as AsaasPixQrCodeResponse;
    } catch (error) {
      console.error('Error getting PIX QR code:', error);
      throw error;
    }
  },

  cancelPayment: async (settings: AsaasSettings, paymentId: string) => {
    try {
      if (!settings.isEnabled || !settings.apiKey) {
        console.log("Asaas is disabled or API key not set, returning mock cancel response");
        return { deleted: true };
      }
      
      const api = createApiInstance(settings.apiKey, settings.sandboxMode);
      const response = await api.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  },

  getPaymentStatus: async (settings: AsaasSettings, paymentId: string) => {
    try {
      if (!settings.isEnabled || !settings.apiKey) {
        console.log("Asaas is disabled or API key not set, returning mock payment status");
        return 'CONFIRMED';
      }
      
      const api = createApiInstance(settings.apiKey, settings.sandboxMode);
      const response = await api.get(`/payments/${paymentId}`);
      return response.data.status;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
};

export default asaasApiService;
