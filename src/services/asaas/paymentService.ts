
import { supabase } from '@/integrations/supabase/client';
import type { AsaasPayment, AsaasPaymentResponse } from '@/types/asaas';

export const saveAsaasPayment = async (
  orderId: number, 
  paymentData: AsaasPaymentResponse
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('asaas_payments')
      .insert({
        order_id: orderId,
        payment_id: paymentData.id,
        method: paymentData.billingType,
        status: paymentData.status,
        value: paymentData.value,
        customer: paymentData.customer,
        billingType: paymentData.billingType,
        dueDate: paymentData.dueDate,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error saving Asaas payment:', error);
    throw error;
  }
};

/**
 * Updates Asaas payment status in the database
 * @param paymentId Asaas payment ID
 * @param status New payment status
 * @returns Promise that resolves when payment status is updated
 */
export const updateAsaasPaymentStatus = async (
  paymentId: string,
  status: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('asaas_payments')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating Asaas payment status:', error);
    throw error;
  }
};

/**
 * Stores PIX QR code data in the database
 * @param paymentId Asaas payment ID
 * @param qrCodeImage QR code image as base64 string
 * @param qrCode PIX payload
 * @returns Promise that resolves when QR code is saved
 */
export const saveAsaasPixQrCode = async (
  paymentId: string,
  qrCodeImage: string,
  qrCode: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('asaas_payments')
      .update({
        qr_code_image: qrCodeImage,
        qr_code: qrCode,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving PIX QR code:', error);
    throw error;
  }
};
