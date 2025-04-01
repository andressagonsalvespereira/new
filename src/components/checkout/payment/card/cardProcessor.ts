import { CardFormData } from '@/components/checkout/payment/card/CardForm';
import { AsaasSettings } from '@/types/asaas';
import { DeviceType } from '@/types/order';
import { CustomerData, PaymentResult } from '@/components/checkout/payment/shared/types';
import { detectDeviceType } from '@/components/checkout/progress/hooks/utils/deviceDetection';

// Helper function to validate card data
function validateCardData(cardData: CardFormData) {
  if (!cardData.cardNumber || cardData.cardNumber.length < 16) {
    throw new Error('Número do cartão inválido');
  }
  if (!cardData.expiryMonth || !cardData.expiryYear) {
    throw new Error('Data de expiração inválida');
  }
  if (!cardData.cvv || cardData.cvv.length < 3) {
    throw new Error('CVV inválido');
  }
  if (!cardData.holderName) {
    throw new Error('Nome do titular do cartão é obrigatório');
  }
}

// Helper function to mask card number for logging
function maskCardNumber(cardNumber: string): string {
  const visibleDigits = 4;
  const maskedLength = cardNumber.length - visibleDigits;
  const maskedPart = '*'.repeat(maskedLength);
  const visiblePart = cardNumber.slice(maskedLength);
  return maskedPart + visiblePart;
}

// Function to detect card brand based on card number prefix
function detectCardBrand(cardNumber: string): string | null {
  const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
  const mastercardRegex = /^5[1-5][0-9]{14}$|^2[2-7][0-9]{14}$/;
  const amexRegex = /^3[47][0-9]{13}$/;
  const dinersRegex = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
  const discoverRegex = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
  const eloRegex = /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368)[0-9]{0,}$/;
  const hipercardRegex = /^(606282)[0-9]{0,}$/;

  if (visaRegex.test(cardNumber)) {
    return 'visa';
  } else if (mastercardRegex.test(cardNumber)) {
    return 'mastercard';
  } else if (amexRegex.test(cardNumber)) {
    return 'amex';
  } else if (dinersRegex.test(cardNumber)) {
    return 'diners';
  } else if (discoverRegex.test(cardNumber)) {
    return 'discover';
  } else if (eloRegex.test(cardNumber)) {
    return 'elo';
  } else if (hipercardRegex.test(cardNumber)) {
    return 'hipercard';
  } else {
    return null;
  }
}

export async function processCardPayment(
  cardData: CardFormData,
  settings: AsaasSettings,
  isSandbox: boolean,
  useCustomProcessing: boolean = false,
  manualCardStatus: string = 'ANALYSIS',
  customerData?: CustomerData,
  isDigitalProduct: boolean = false
): Promise<PaymentResult> {
  console.log('Processing card payment with data:', {
    cardNumber: maskCardNumber(cardData.cardNumber),
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    holderName: cardData.holderName,
    isSandbox
  });

  // Detect device type for analytics
  const deviceType = detectDeviceType();
  
  try {
    // Validate card data
    validateCardData(cardData);
    
    // Detect card brand/flag
    const brand = detectCardBrand(cardData.cardNumber);
    
    // If custom processing is enabled, use the manual status provided
    if (useCustomProcessing) {
      console.log('Using custom card processing with status:', manualCardStatus);
      
      // Create timestamp
      const timestamp = new Date().toISOString();
      const orderDate = new Date().toISOString();
      
      // Determine payment status based on manual status
      let status = 'pending';
      let paymentStatus = 'Pendente';
      
      if (manualCardStatus.toUpperCase() === 'APPROVED') {
        status = 'confirmed';
        paymentStatus = 'Pago';
      } else if (manualCardStatus.toUpperCase() === 'DECLINED') {
        status = 'declined';
        paymentStatus = 'Cancelado';
      }

      // Create payment result
      const paymentResult: PaymentResult = {
        success: status !== 'declined',
        method: 'card',
        paymentId: `card_${Date.now()}`,
        status: status,
        timestamp: timestamp,
        cardNumber: maskCardNumber(cardData.cardNumber),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        brand: brand || 'unknown',
        deviceType,
        isDigitalProduct
      };
      
      return paymentResult;
    }
    
    // Process normally in sandbox mode
    if (isSandbox) {
      console.log('Processing card payment in sandbox mode');
      
      // Create timestamp
      const timestamp = new Date().toISOString();
      const orderDate = new Date().toISOString();

      // Handle sandbox testing with specific test cards
      if (cardData.cardNumber.startsWith('4111')) {
        // Test card: always approved
        const paymentResult: PaymentResult = {
          success: true,
          method: 'card',
          paymentId: `card_${Date.now()}`,
          status: 'confirmed',
          timestamp: timestamp,
          cardNumber: maskCardNumber(cardData.cardNumber),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          brand: brand || 'visa',
          deviceType,
          isDigitalProduct
        };
        
        return paymentResult;
      } else if (cardData.cardNumber.startsWith('5555')) {
        // Test card: always declined
        throw new Error('Pagamento recusado pela operadora');
      }
      
      // Default sandbox behavior: simulate success
      const paymentResult: PaymentResult = {
        success: true,
        method: 'card',
        paymentId: `card_${Date.now()}`,
        status: 'confirmed',
        timestamp: timestamp,
        cardNumber: maskCardNumber(cardData.cardNumber),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        brand: brand || 'unknown',
        deviceType,
        isDigitalProduct
      };
      
      return paymentResult;
    }
    
    // Production card processing would go here, integrate with Asaas API
    console.log('Production card processing not implemented');
    throw new Error('Processamento em produção não implementado');
    
  } catch (error) {
    console.error('Error processing card payment:', error);
    
    return {
      success: false,
      method: 'card',
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar pagamento',
      status: 'error',
      timestamp: new Date().toISOString(),
      cardNumber: maskCardNumber(cardData.cardNumber),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      deviceType
    };
  }
}
