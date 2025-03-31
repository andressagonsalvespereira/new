
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CardNameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  error?: string;
}

const CardNameField = ({ value, onChange, disabled, error }: CardNameFieldProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="cardName">Nome no cartão</Label>
      <Input
        id="cardName"
        placeholder="Nome como aparece no cartão"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CardNameField;
