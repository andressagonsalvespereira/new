
// Arquivo dedicado à validação de cartões de crédito
import { z } from "zod";
import { validateCVV } from "@/utils/validators";

export interface CardValidationErrors {
  cardName?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

// Current date info for expiry validation
const now = new Date();
const currentYear = now.getFullYear() % 100; // Last two digits of current year
const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

// Zod schema for card validation
export const CardSchema = z.object({
  cardName: z.string().min(1, "Nome no cartão é obrigatório"),
  cardNumber: z.string()
    .min(16, "Número do cartão inválido")
    .max(19, "Número do cartão inválido")
    .refine(val => val.replace(/\s/g, '').length >= 16, {
      message: "Número do cartão deve ter pelo menos 16 dígitos"
    }),
  expiryMonth: z.string()
    .min(1, "Mês de validade é obrigatório")
    .max(2, "Mês inválido")
    .refine((val) => {
      const month = parseInt(val, 10);
      return !isNaN(month) && month >= 1 && month <= 12;
    }, "Mês inválido (1-12)")
    .refine((month, ctx) => {
      const year = parseInt(ctx.data.expiryYear, 10);
      // If it's the current year, month must be current or future
      if (year === currentYear && parseInt(month, 10) < currentMonth) {
        return false;
      }
      return true;
    }, "Cartão expirado"),
  expiryYear: z.string()
    .min(2, "Ano de validade é obrigatório")
    .max(2, "Ano inválido (AA)")
    .refine((val) => {
      const year = parseInt(val, 10);
      return !isNaN(year) && year >= currentYear;
    }, "Ano inválido ou expirado"),
  cvv: z.string()
    .min(3, "CVV inválido")
    .max(3, "CVV inválido")
    .refine((val) => validateCVV(val), "CVV inválido (não pode ser 000)")
});

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
