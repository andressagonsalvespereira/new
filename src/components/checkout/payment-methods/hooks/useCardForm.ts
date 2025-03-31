
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CardSchema } from '@/components/checkout/utils/cardValidation';
import { detectCardBrand } from '@/components/checkout/utils/payment/cardDetection';
import { validateCVV } from '@/utils/validators';
import { CardFormData } from '../CardForm';

export const useCardForm = (onFormSubmit: (data: CardFormData) => void) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardBrand, setCardBrand] = useState<string>('');
  
  const { register, handleSubmit, formState, watch, setValue } = useForm<CardFormData>({
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    }
  });

  const cardNumber = watch('cardNumber');
  const expiryMonth = watch('expiryMonth');
  const expiryYear = watch('expiryYear');
  const cvv = watch('cvv');

  useEffect(() => {
    if (cardNumber && cardNumber.length >= 4) {
      const brand = detectCardBrand(cardNumber);
      setCardBrand(brand);
    } else {
      setCardBrand('');
    }
  }, [cardNumber]);

  // Restrict month to 2 digits and valid values
  useEffect(() => {
    if (expiryMonth) {
      const month = expiryMonth.replace(/\D/g, '');
      if (month.length > 2) {
        setValue('expiryMonth', month.substring(0, 2));
      }

      // Make sure month is between 1-12
      if (month.length === 2) {
        const monthValue = parseInt(month);
        if (monthValue > 12) {
          setValue('expiryMonth', '12');
        } else if (monthValue < 1) {
          setValue('expiryMonth', '01');
        }
      }
    }
  }, [expiryMonth, setValue]);

  // Restrict year to 2 digits
  useEffect(() => {
    if (expiryYear) {
      const year = expiryYear.replace(/\D/g, '');
      if (year.length > 2) {
        setValue('expiryYear', year.substring(0, 2));
      }
    }
  }, [expiryYear, setValue]);

  // Validate CVV
  useEffect(() => {
    if (cvv) {
      const cleanCvv = cvv.replace(/\D/g, '');
      if (cleanCvv.length > 3) {
        setValue('cvv', cleanCvv.substring(0, 3));
      }
    }
  }, [cvv, setValue]);

  const validateForm = (data: CardFormData) => {
    try {
      CardSchema.parse(data);
      
      // Validate CVV is not 000
      if (!validateCVV(data.cvv)) {
        setErrors({ cvv: 'CVV inválido (não pode ser 000)' });
        return false;
      }
      
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
      onFormSubmit(data);
    }
  };

  return {
    register,
    handleSubmit,
    processSubmit,
    errors,
    cardBrand,
    watch
  };
};
