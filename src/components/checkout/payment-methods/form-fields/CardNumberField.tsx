
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardFormData } from '../CardForm';
import { detectCardBrand } from '@/components/checkout/utils/payment/cardDetection';
import { formatCardNumber } from '@/components/checkout/utils/cardValidation';

interface CardNumberFieldProps {
  disabled: boolean;
  error?: string;
}

const CardNumberField = ({ disabled, error }: CardNumberFieldProps) => {
  const { control, watch } = useFormContext<CardFormData>();
  const cardNumber = watch('cardNumber');
  const cardBrand = cardNumber && cardNumber.length >= 4 ? detectCardBrand(cardNumber) : '';
  
  return (
    <div className="space-y-1">
      <Label htmlFor="cardNumber" className="flex items-center justify-between">
        <span>Número do cartão</span>
        {cardBrand && (
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {cardBrand}
          </span>
        )}
      </Label>
      <Controller
        name="cardNumber"
        control={control}
        render={({ field }) => (
          <Input
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            disabled={disabled}
            className={error ? "border-red-500" : ""}
            value={field.value}
            onChange={(e) => {
              const formattedValue = formatCardNumber(e.target.value);
              field.onChange(formattedValue);
            }}
            onBlur={field.onBlur}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CardNumberField;
