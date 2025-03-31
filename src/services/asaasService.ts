
import asaasApiService from './asaas/asaasApiService';
import {
  getAsaasConfig,
  getAsaasSettings,
  saveAsaasConfig,
  saveAsaasSettings,
  saveAsaasPayment,
  updateAsaasPaymentStatus,
  saveAsaasPixQrCode
} from './asaas/index';

// Re-export types
export type {
  AsaasSettings,
  AsaasCustomer,
  AsaasPayment,
  AsaasPaymentResponse,
  AsaasPixQrCodeResponse
} from '@/types/asaas';

// Re-export configuration functions
export {
  getAsaasConfig,
  getAsaasSettings,
  saveAsaasConfig,
  saveAsaasSettings,
  saveAsaasPayment,
  updateAsaasPaymentStatus,
  saveAsaasPixQrCode
};

// Export the API service as default
export default asaasApiService;
