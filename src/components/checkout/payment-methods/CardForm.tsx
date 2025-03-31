
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CardSchema } from '@/components/checkout/utils/cardValidation';

export interface CardFormData {
  cardName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  loading?: boolean;
}

const CardForm: React.FC<CardFormProps> = ({ onSubmit, loading = false }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<CardFormData>({
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    }
  });

  const validateForm = (data: CardFormData) => {
    try {
      CardSchema.parse(data);
      setErrors({});
      return true;
    } catch (error: any) {
      const formattedErrors: Record<string, string> = {};
      error.errors.forEach((err: any) => {
        if (err.path) {
          formattedErrors[err.path[0]] = err.message;
        }
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const processSubmit = (data: CardFormData) => {
    if (validateForm(data)) {
      // Não mascare o CVV ao submeter - vamos armazená-lo completo
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="cardName">Nome no cartão</Label>
        <Input
          id="cardName"
          placeholder="Nome como aparece no cartão"
          {...register('cardName')}
          disabled={loading || isSubmitting}
          className={errors.cardName ? "border-red-500" : ""}
        />
        {errors.cardName && <p className="text-xs text-red-500">{errors.cardName}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="cardNumber">Número do cartão</Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          {...register('cardNumber')}
          disabled={loading || isSubmitting}
          className={errors.cardNumber ? "border-red-500" : ""}
        />
        {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="expiryMonth">Mês</Label>
          <Input
            id="expiryMonth"
            placeholder="MM"
            {...register('expiryMonth')}
            disabled={loading || isSubmitting}
            className={errors.expiryMonth ? "border-red-500" : ""}
          />
          {errors.expiryMonth && <p className="text-xs text-red-500">{errors.expiryMonth}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="expiryYear">Ano</Label>
          <Input
            id="expiryYear"
            placeholder="AAAA"
            {...register('expiryYear')}
            disabled={loading || isSubmitting}
            className={errors.expiryYear ? "border-red-500" : ""}
          />
          {errors.expiryYear && <p className="text-xs text-red-500">{errors.expiryYear}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="text"
            placeholder="123"
            {...register('cvv')}
            disabled={loading || isSubmitting}
            className={errors.cvv ? "border-red-500" : ""}
          />
          {errors.cvv && <p className="text-xs text-red-500">{errors.cvv}</p>}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || isSubmitting}
      >
        {loading || isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </span>
        ) : (
          <span className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Pagar com Cartão
          </span>
        )}
      </Button>
    </form>
  );
};

export default CardForm;
