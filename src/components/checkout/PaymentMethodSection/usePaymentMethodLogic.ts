
import { useState, useEffect } from 'react';

export const usePaymentMethodLogic = (
  settings: any, 
  setPaymentMethod: React.Dispatch<React.SetStateAction<'card' | 'pix'>>
) => {
  useEffect(() => {
    if (settings) {
      const paymentConfigEnabled = settings.isEnabled || settings.manualPaymentConfig;
      const pixEnabled = paymentConfigEnabled && settings.allowPix;
      const cardEnabled = paymentConfigEnabled && settings.allowCreditCard;

      if (!pixEnabled && cardEnabled) {
        setPaymentMethod('card');
      } else if (pixEnabled && !cardEnabled) {
        setPaymentMethod('pix');
      }
    }
  }, [settings, setPaymentMethod]);
};
