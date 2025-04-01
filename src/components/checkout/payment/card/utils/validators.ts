
import { z } from 'zod';

/**
 * Obtém o mês e ano atuais para validação
 * @returns Objeto contendo mês e ano atuais
 */
const getCurrentDate = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear() % 100 // Get last two digits of year
  };
};

/**
 * Valida se o cartão não está expirado
 * @param month Mês de expiração (1-12)
 * @param year Ano de expiração (últimos 2 dígitos)
 * @returns true se o cartão não está expirado, false caso contrário
 */
export const validateCardExpiry = (month: string, year: string): boolean => {
  const currentDate = getCurrentDate();
  const expYear = parseInt(year, 10);
  const expMonth = parseInt(month, 10);
  
  // Se o ano de expiração é maior que o ano atual, cartão não está expirado
  if (expYear > currentDate.year) {
    return true;
  }
  
  // Se o ano de expiração é o ano atual, verifica se o mês é atual ou futuro
  if (expYear === currentDate.year && expMonth >= currentDate.month) {
    return true;
  }
  
  return false;
};

/**
 * Esquema de validação para dados de cartão de crédito
 */
export const CardSchema = z.object({
  cardName: z.string().min(3, 'Nome no cartão precisa ter pelo menos 3 caracteres'),
  
  // Número do cartão deve ter entre 13-19 dígitos, removemos espaços para validação
  cardNumber: z.string()
    .min(13, 'Número do cartão inválido')
    .refine((val) => /^[\d\s]{13,19}$/.test(val), 'Número do cartão inválido'),
  
  // Mês: 01-12
  expiryMonth: z.string()
    .refine((val) => /^(0[1-9]|1[0-2])$/.test(val), 'Mês inválido'),
  
  // Ano: ano atual ou posterior, dois dígitos
  expiryYear: z.string()
    .refine((val) => /^\d{2}$/.test(val), 'Ano inválido')
    .refine(
      (val) => {
        const currentYear = getCurrentDate().year;
        const inputYear = parseInt(val, 10);
        return inputYear >= currentYear;
      }, 
      'O cartão está expirado'
    ),
  
  // CVV: 3-4 dígitos
  cvv: z.string()
    .refine((val) => /^\d{3,4}$/.test(val), 'CVV inválido')
}).refine(
  (data) => validateCardExpiry(data.expiryMonth, data.expiryYear),
  {
    message: "O cartão está expirado",
    path: ["expiryYear"]
  }
);

/**
 * Valida todos os campos do cartão de uma vez e retorna erros se houver
 * @param cardName Nome no cartão
 * @param cardNumber Número do cartão
 * @param expiryMonth Mês de expiração
 * @param expiryYear Ano de expiração
 * @param cvv Código de segurança
 * @returns null se não houver erros, ou objeto com erros por campo
 */
export const validateCardForm = (
  cardName: string,
  cardNumber: string,
  expiryMonth: string,
  expiryYear: string,
  cvv: string
): Record<string, string> | null => {
  try {
    CardSchema.parse({
      cardName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv
    });
    return null; // No errors
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod error format to a simpler object
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
      return errors;
    }
    
    return { general: 'Erro desconhecido na validação do cartão' };
  }
};
