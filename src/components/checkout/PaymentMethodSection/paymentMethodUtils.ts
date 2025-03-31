
/**
 * Adapts the createOrder callback to formats needed by different payment components
 */
export const adaptOrderCallback = (
  createOrder?: (
    paymentId: string, 
    status: 'pending' | 'confirmed',
    cardDetails?: any,
    pixDetails?: any
  ) => Promise<any>
) => {
  // Adapts for card form
  const cardFormCallback = createOrder ? (data: any) => {
    return createOrder(
      data.paymentId, 
      data.status === 'CONFIRMED' ? 'confirmed' : 'pending',
      {
        number: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        brand: data.brand
      }
    );
  } : undefined;
  
  // Adapts for pix payment
  const pixFormCallback = createOrder ? (data: any) => {
    return createOrder(
      data.paymentId, 
      'pending',
      undefined,
      {
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        expirationDate: data.expirationDate
      }
    );
  } : undefined;
  
  return {
    cardFormCallback,
    pixFormCallback
  };
};

/**
 * Checks if payment methods are available based on settings
 */
export const checkPaymentMethodsAvailability = (settings: any) => {
  if (!settings) {
    return {
      paymentConfigEnabled: false,
      pixEnabled: false,
      cardEnabled: false
    };
  }
  
  const paymentConfigEnabled = settings.isEnabled || settings.manualPaymentConfig;
  const pixEnabled = paymentConfigEnabled && settings.allowPix;
  const cardEnabled = paymentConfigEnabled && settings.allowCreditCard;
  
  return {
    paymentConfigEnabled,
    pixEnabled,
    cardEnabled
  };
};
