
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Check, AlertCircle } from 'lucide-react';

interface CheckoutFormProps {
  onSubmit: (data: any) => void;
}

const CheckoutForm = ({ onSubmit }: CheckoutFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Basic validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setError('Por favor, preencha todos os campos');
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Pass data to parent component
      onSubmit({
        method: 'card',
        cardNumber,
        cardName,
        expiryDate,
        cvv
      });
    }, 1500);
  };

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

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cardName">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="Ex: João da Silva"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="border-gray-300 focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="border-gray-300 focus:border-blue-400 pl-10"
                  required
                />
                <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Utilizamos criptografia de ponta a ponta para proteger seus dados
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  className="border-gray-300 focus:border-blue-400"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={3}
                  className="border-gray-300 focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                {isSubmitting ? 'Processando...' : 'Finalizar Pagamento'}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Ao clicar em "Finalizar Pagamento", você concorda com nossos Termos de Serviço
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
