
import { AsaasSettings, AsaasCustomer, AsaasPayment } from '@/types/asaas';
import { createAsaasCustomer } from './asaas/asaasApiService';
import { createPayment, retrievePixQrCode } from './asaas/paymentService';
import { logger } from '@/utils/logger';

// Customer creation
export async function createCustomer(
  customerData: AsaasCustomer,
  settings: AsaasSettings
) {
  const { apiKey, sandboxMode } = settings;
  
  try {
    logger.log('Creating customer in Asaas');
    return await createAsaasCustomer(customerData, apiKey, sandboxMode);
  } catch (error) {
    logger.error('Error creating customer:', error);
    throw error;
  }
}

// Payment creation
export async function processPayment(
  paymentData: AsaasPayment,
  settings: AsaasSettings
) {
  const { apiKey, sandboxMode } = settings;
  
  try {
    logger.log('Processing payment through Asaas');
    const paymentResult = await createPayment(paymentData, apiKey, sandboxMode);
    
    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }
    
    // For PIX payments, we need to get the QR code
    if (paymentData.billingType === 'PIX' && paymentResult.paymentId) {
      logger.log('Getting PIX QR code for payment', paymentResult.paymentId);
      
      const pixResult = await retrievePixQrCode(
        paymentResult.paymentId,
        apiKey,
        sandboxMode
      );
      
      if (!pixResult.success) {
        throw new Error(pixResult.error);
      }
      
      return {
        ...paymentResult,
        pixQrCode: pixResult.qrCode,
        pixQrCodeImage: pixResult.qrCodeImage,
        pixExpirationDate: pixResult.expirationDate
      };
    }
    
    return paymentResult;
  } catch (error) {
    logger.error('Error processing payment:', error);
    throw error;
  }
}

// Get PIX QR code
export async function getPixQrCode(
  paymentId: string,
  settings: AsaasSettings
) {
  const { apiKey, sandboxMode } = settings;
  
  try {
    logger.log('Getting PIX QR code for payment', paymentId);
    return await retrievePixQrCode(paymentId, apiKey, sandboxMode);
  } catch (error) {
    logger.error('Error getting PIX QR code:', error);
    throw error;
  }
}
