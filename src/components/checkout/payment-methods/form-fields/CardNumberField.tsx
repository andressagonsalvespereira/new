
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CardNumberFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  error?: string;
  cardBrand: string;
}

const CardNumberField = ({ value, onChange, disabled, error, cardBrand }: CardNumberFieldProps) => {
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
      <Input
        id="cardNumber"
        placeholder="0000 0000 0000 0000"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CardNumberField;
