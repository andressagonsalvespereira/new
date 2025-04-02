import { CustomerData } from '@/components/checkout/utils/payment/types';

/**
 * Validates customer data to ensure all required fields are properly filled
 * @param customerData The customer data to validate
 * @returns Error message or null if valid
 */
export const validateCustomerData = (customerData: CustomerData): string | null => {
  if (!customerData.name || customerData.name.trim().length < 3) {
    return "Nome completo é obrigatório (mínimo 3 caracteres)";
  }

  if (!customerData.email || !customerData.email.includes('@')) {
    return "E-mail inválido";
  }

  const cpf = customerData.cpf ? customerData.cpf.replace(/\D/g, '') : '';
  if (!cpf || cpf.length !== 11) {
    return "CPF inválido";
  }

  const phone = customerData.phone ? customerData.phone.replace(/\D/g, '') : '';
  if (!phone || phone.length < 10) {
    return "Telefone inválido";
  }

  return null;
};
