
import { CheckoutFormState } from './types';

/**
 * Validates the checkout form fields
 */
export const validateCheckoutForm = (formState: CheckoutFormState): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formState.fullName) errors.fullName = 'Nome é obrigatório';
  if (!formState.email) errors.email = 'Email é obrigatório';
  else if (!/\S+@\S+\.\S+/.test(formState.email)) errors.email = 'Email inválido';
  if (!formState.cpf) errors.cpf = 'CPF é obrigatório';
  if (!formState.phone) errors.phone = 'Telefone é obrigatório';
  if (!formState.cep) errors.cep = 'CEP é obrigatório';
  if (!formState.street) errors.street = 'Rua é obrigatória';
  if (!formState.number) errors.number = 'Número é obrigatório';
  if (!formState.neighborhood) errors.neighborhood = 'Bairro é obrigatório';
  if (!formState.city) errors.city = 'Cidade é obrigatória';
  if (!formState.state) errors.state = 'Estado é obrigatório';
  
  return errors;
};
