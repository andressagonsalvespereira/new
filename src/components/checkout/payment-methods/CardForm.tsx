
import React from 'react';
import { useCheckoutCustomization } from '@/contexts/CheckoutCustomizationContext';
import { useCardForm } from './hooks/useCardForm';
import CardNameField from './form-fields/CardNameField';
import CardNumberField from './form-fields/CardNumberField';
import CardExpiryFields from './form-fields/CardExpiryFields';
import CVVField from './form-fields/CVVField';
import CardSubmitButton from './buttons/CardSubmitButton';

export interface CardFormData {
  cardName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  isSubmitting?: boolean;
  buttonText?: string;
  loading?: boolean;
}

const CardForm: React.FC<CardFormProps> = ({ 
  onSubmit, 
  loading = false, 
  isSubmitting = false,
  buttonText = "Pagar com Cartão"
}) => {
  const { customization } = useCheckoutCustomization();
  const { register, handleSubmit, processSubmit, errors, cardBrand, watch } = useCardForm(onSubmit);

  // Get button styles from customization
  const buttonStyle = {
    backgroundColor: customization?.button_color || '#4caf50',
    color: customization?.button_text_color || '#ffffff'
  };

  // Use custom button text from customization if available
  const displayButtonText = customization?.button_text || buttonText;

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <CardNameField 
        value={watch('cardName')}
        onChange={(e) => register('cardName').onChange(e)}
        disabled={loading || isSubmitting}
        error={errors.cardName}
      />

      <CardNumberField 
        value={watch('cardNumber')}
        onChange={(e) => register('cardNumber').onChange(e)}
        disabled={loading || isSubmitting}
        error={errors.cardNumber}
        cardBrand={cardBrand}
      />

      <div className="grid grid-cols-3 gap-4">
        <CardExpiryFields 
          monthValue={watch('expiryMonth')}
          yearValue={watch('expiryYear')}
          onMonthChange={(e) => register('expiryMonth').onChange(e)}
          onYearChange={(e) => register('expiryYear').onChange(e)}
          disabled={loading || isSubmitting}
          monthError={errors.expiryMonth}
          yearError={errors.expiryYear}
        />
        
        <CVVField 
          value={watch('cvv')}
          onChange={(e) => register('cvv').onChange(e)}
          disabled={loading || isSubmitting}
          error={errors.cvv}
        />
      </div>

      <CardSubmitButton 
        isLoading={loading}
        isSubmitting={isSubmitting}
        buttonText={displayButtonText}
        buttonStyle={buttonStyle}
      />
    </form>
  );
};

export default CardForm;
