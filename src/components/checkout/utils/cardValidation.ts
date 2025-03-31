
// Arquivo dedicado à validação de cartões de crédito
import { z } from "zod";

export interface CardValidationErrors {
  cardName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

// Zod schema for card validation
export const CardSchema = z.object({
  cardName: z.string().min(1, "Nome no cartão é obrigatório"),
  cardNumber: z.string().min(16, "Número do cartão inválido").max(19, "Número do cartão inválido"),
  expiryMonth: z.string().min(1, "Mês de validade é obrigatório").max(2, "Mês inválido"),
  expiryYear: z.string().min(4, "Ano de validade é obrigatório").max(4, "Ano inválido"),
  cvv: z.string().min(3, "CVV inválido").max(4, "CVV inválido")
});

/**
 * Valida os dados do cartão de crédito
 */
export const validateCardForm = (
  cardName: string,
  cardNumber: string,
  expiryMonth: string,
  expiryYear: string,
  cvv: string
): CardValidationErrors | null => {
  const errors: CardValidationErrors = {};
  const cleanCardNumber = cardNumber.replace(/\s+/g, '');
  
  if (!cardName.trim()) {
    errors.cardName = 'Nome no cartão é obrigatório';
  }
  
  if (cleanCardNumber.length < 16) {
    errors.cardNumber = 'Número do cartão inválido';
  }
  
  if (!expiryMonth) {
    errors.expiryMonth = 'Mês de validade é obrigatório';
  } else {
    const month = parseInt(expiryMonth, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      errors.expiryMonth = 'Mês inválido (1-12)';
    }
  }
  
  if (!expiryYear) {
    errors.expiryYear = 'Ano de validade é obrigatório';
  } else {
    const year = parseInt(expiryYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear) {
      errors.expiryYear = `Ano inválido (deve ser ${currentYear} ou posterior)`;
    }
  }
  
  if (!cvv || cvv.length < 3) {
    errors.cvv = 'CVV inválido';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Formata o número do cartão com espaços a cada 4 dígitos
 */
export const formatCardNumber = (value: string): string => {
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

/**
 * Mascara o número do cartão para exibição segura
 */
export const maskCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\d(?=\d{4})/g, '*');
};
