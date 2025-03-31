
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CardExpiryFieldsProps {
  monthValue: string;
  yearValue: string;
  onMonthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  monthError?: string;
  yearError?: string;
}

const CardExpiryFields = ({ 
  monthValue, 
  yearValue, 
  onMonthChange, 
  onYearChange, 
  disabled, 
  monthError, 
  yearError 
}: CardExpiryFieldsProps) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="expiryMonth">Mês</Label>
        <Input
          id="expiryMonth"
          placeholder="MM"
          value={monthValue}
          onChange={onMonthChange}
          disabled={disabled}
          className={monthError ? "border-red-500" : ""}
          maxLength={2}
        />
        {monthError && <p className="text-xs text-red-500">{monthError}</p>}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="expiryYear">Ano</Label>
        <Input
          id="expiryYear"
          placeholder="AA"
          value={yearValue}
          onChange={onYearChange}
          disabled={disabled}
          className={yearError ? "border-red-500" : ""}
          maxLength={2}
        />
        {yearError && <p className="text-xs text-red-500">{yearError}</p>}
      </div>
    </>
  );
};

export default CardExpiryFields;
