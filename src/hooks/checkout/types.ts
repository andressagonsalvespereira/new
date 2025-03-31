
/**
 * Types for the checkout form functionality
 */

export interface CheckoutFormState {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  formErrors: Record<string, string>;
  selectedShipping: string | null;
  deliveryEstimate: string | null;
}
