
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CVVFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  error?: string;
}

const CVVField = ({ value, onChange, disabled, error }: CVVFieldProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="cvv">CVV</Label>
      <Input
        id="cvv"
        type="text"
        placeholder="123"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
        maxLength={3}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default CVVField;
