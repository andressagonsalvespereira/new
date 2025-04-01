
import { 
  AsaasPayment, 
  AsaasPaymentResponse, 
  AsaasPixQrCodeResponse 
} from '@/types/asaas';
import { createAsaasPayment, getPixQrCode } from './asaasApiService';
import { logger } from '@/utils/logger';

export interface CreatePaymentResult {
  success: boolean;
  paymentId?: string;
  invoiceUrl?: string;
  status?: string;
  error?: string;
}

export interface GetPixQrCodeResult {
  success: boolean;
  qrCodeImage?: string;
  qrCode?: string;
  expirationDate?: string;
  error?: string;
}

export const createPayment = async (
  payment: AsaasPayment, 
  apiKey: string, 
  sandboxMode: boolean
): Promise<CreatePaymentResult> => {
  try {
    logger.log('Creating Asaas payment', {
      value: payment.value,
      billingType: payment.billingType,
      customerId: payment.customer,
      hasCreditCardInfo: !!payment.creditCard
    });
    
    const { data, error } = await createAsaasPayment(payment, apiKey, sandboxMode);
    
    if (error || !data) {
      logger.error('Failed to create Asaas payment', error);
      return { 
        success: false, 
        error: error?.message || 'Failed to create payment' 
      };
    }
    
    return {
      success: true,
      paymentId: data.id,
      invoiceUrl: data.invoiceUrl,
      status: data.status
    };
    
  } catch (error) {
    logger.error('Error in createPayment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating payment' 
    };
  }
};

export const retrievePixQrCode = async (
  paymentId: string, 
  apiKey: string, 
  sandboxMode: boolean
): Promise<GetPixQrCodeResult> => {
  try {
    logger.log('Retrieving PIX QR code for payment', paymentId);
    
    const { data, error } = await getPixQrCode(paymentId, apiKey, sandboxMode);
    
    if (error || !data) {
      logger.error('Failed to retrieve PIX QR code', error);
      return { 
        success: false, 
        error: error?.message || 'Failed to retrieve PIX QR code' 
      };
    }
    
    return {
      success: true,
      qrCodeImage: data.encodedImage,
      qrCode: data.payload,
      expirationDate: data.expirationDate
    };
    
  } catch (error) {
    logger.error('Error in retrievePixQrCode:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error retrieving PIX QR code' 
    };
  }
};
