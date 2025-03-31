
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
    }
  });
};

const asaasApiService = {
  createCustomer: async (settings: AsaasSettings, customerData: AsaasCustomer) => {
    try {
      const api = createApiInstance(settings.apiKey, settings.sandboxMode);
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  createPayment: async (settings: AsaasSettings, paymentData: AsaasPayment) => {
    try {
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
