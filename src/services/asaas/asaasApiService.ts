
import axios from 'axios';
import { AsaasSettings, AsaasApiResponse, AsaasCustomer, AsaasPayment, AsaasPaymentResponse, AsaasPixQrCodeResponse } from '@/types/asaas';
import { logger } from '@/utils/logger';

// Determine API base URL based on sandbox mode
export const getAsaasApiBaseUrl = (sandboxMode: boolean): string => {
  return sandboxMode 
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://www.asaas.com/api/v3';
};

// Main API call function
export const callAsaasApi = async <T>(
  endpoint: string, 
  method: string, 
  data: any = null,
  apiKey: string,
  sandboxMode: boolean
): Promise<AsaasApiResponse<T>> => {
  const baseUrl = getAsaasApiBaseUrl(sandboxMode);
  const url = `${baseUrl}${endpoint}`;
  
  try {
    logger.log(`Calling Asaas API: ${method} ${url}`);
    
    const response = await axios({
      method,
      url,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' ? data : undefined,
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      }
    });

    logger.log(`Asaas API response status: ${response.status}`);
    return { data: response.data, status: response.status };
  } catch (error) {
    logger.error('Asaas API error:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.errors?.[0]?.description || 
                     error.response?.data?.message ||
                     error.message ||
                     'Unknown error';
      
      return { 
        error: { 
          message,
          code: error.response?.data?.errors?.[0]?.code || error.code
        },
        status: error.response?.status
      };
    }
    
    return { 
      error: { message: String(error) },
      status: 500
    };
  }
};

// API call to create a payment
export const createAsaasPayment = async (
  paymentData: AsaasPayment,
  apiKey: string,
  sandboxMode: boolean
): Promise<AsaasApiResponse<AsaasPaymentResponse>> => {
  return callAsaasApi<AsaasPaymentResponse>(
    '/payments', 
    'POST', 
    paymentData, 
    apiKey, 
    sandboxMode
  );
};

// API call to get PIX QR code
export const getPixQrCode = async (
  paymentId: string,
  apiKey: string,
  sandboxMode: boolean
): Promise<AsaasApiResponse<AsaasPixQrCodeResponse>> => {
  return callAsaasApi<AsaasPixQrCodeResponse>(
    `/payments/${paymentId}/pixQrCode`, 
    'GET', 
    null, 
    apiKey, 
    sandboxMode
  );
};

// API call to create a customer
export const createAsaasCustomer = async (
  customerData: AsaasCustomer,
  apiKey: string,
  sandboxMode: boolean
) => {
  return callAsaasApi<AsaasCustomer>(
    '/customers', 
    'POST', 
    customerData, 
    apiKey, 
    sandboxMode
  );
};
