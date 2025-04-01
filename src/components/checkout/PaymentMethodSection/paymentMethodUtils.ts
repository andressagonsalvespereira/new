
import { PaymentResult } from '../payment/shared/types';
import { Order, CardDetails, PixDetails } from '@/types/order';

interface AdaptedCallbacks {
  cardFormCallback: (data: any) => Promise<any>;
  pixFormCallback: (data: any) => Promise<any>;
}

/**
 * Adapts the order callback function for different payment components
 */
export const adaptOrderCallback = (
  createOrder?: (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: CardDetails,
    pixDetails?: PixDetails
  ) => Promise<Order>
): AdaptedCallbacks => {
  // Default function if no createOrder provided
  const defaultCreateOrder = async () => ({} as Order);
  
  // Use provided or default function
  const orderCreator = createOrder || defaultCreateOrder;
  
  const cardFormCallback = async (paymentData: PaymentResult): Promise<any> => {
    console.log('Processing card payment with data:', {
      paymentId: paymentData.paymentId,
      status: paymentData.status,
      brand: paymentData.brand,
      cardNumber: paymentData.cardNumber ? `****${paymentData.cardNumber.slice(-4)}` : undefined,
    });
    
    try {
      // Create an order with the card details
      const order = await orderCreator(
        paymentData.paymentId || 'unknown_payment_id',
        paymentData.status === 'CONFIRMED' ? 'confirmed' : 'pending',
        {
          number: paymentData.cardNumber || '',
          expiryMonth: paymentData.expiryMonth || '',
          expiryYear: paymentData.expiryYear || '',
          cvv: paymentData.cvv || '',
          brand: paymentData.brand || 'Desconhecida'
        },
        undefined
      );
      
      return order;
    } catch (error) {
      console.error('Error in cardFormCallback:', error);
      throw error;
    }
  };
  
  const pixFormCallback = async (paymentData: PaymentResult): Promise<any> => {
    console.log('Processing PIX payment with data:', {
      paymentId: paymentData.paymentId,
      hasQrCode: !!paymentData.qrCode,
      hasQrCodeImage: !!paymentData.qrCodeImage,
    });
    
    try {
      // Create an order with the PIX details
      const order = await orderCreator(
        paymentData.paymentId || 'unknown_payment_id',
        'pending',
        undefined,
        {
          qrCode: paymentData.qrCode,
          qrCodeImage: paymentData.qrCodeImage,
          expirationDate: paymentData.expirationDate
        }
      );
      
      return order;
    } catch (error) {
      console.error('Error in pixFormCallback:', error);
      throw error;
    }
  };
  
  return {
    cardFormCallback,
    pixFormCallback
  };
};

/**
 * Checks which payment methods are available based on settings
 */
export const checkPaymentMethodsAvailability = (settings: any) => {
  const pixEnabled = settings?.allowPix !== false;
  const cardEnabled = settings?.allowCreditCard !== false;
  
  return { pixEnabled, cardEnabled };
};
