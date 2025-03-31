
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CardFormProps {
  onSubmit: (cardData: CardFormData) => void;
  isSubmitting: boolean;
  buttonText: string;
}

export interface CardFormData {
  cardName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const CardForm: React.FC<CardFormProps> = ({ onSubmit, isSubmitting, buttonText }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cardName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <Label htmlFor="cardName" className="text-sm">Nome no Cartão</Label>
        <Input
          id="cardName"
          placeholder="Nome impresso no cartão"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="h-9 mt-1 border-gray-300"
          disabled={isSubmitting}
        />
      </div>

      <div className="mt-3">
        <Label htmlFor="cardNumber" className="text-sm">Número do Cartão</Label>
        <div className="relative mt-1">
          <Input
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="h-9 border-gray-300 pl-10"
            disabled={isSubmitting}
          />
          <CreditCard className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="col-span-2">
          <Label className="text-sm">Validade</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Select value={expiryMonth} onValueChange={setExpiryMonth} disabled={isSubmitting}>
              <SelectTrigger className="h-9 border-gray-300">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  return (
                    <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <Select value={expiryYear} onValueChange={setExpiryYear} disabled={isSubmitting}>
              <SelectTrigger className="h-9 border-gray-300">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="cvv" className="text-sm">CVV</Label>
          <Input
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={4}
            className="h-9 mt-1 border-gray-300"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mt-4">
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            buttonText
          )}
        </Button>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Seu pagamento está seguro e criptografado
        </div>
      </div>
    </form>
  );
};

export default CardForm;
