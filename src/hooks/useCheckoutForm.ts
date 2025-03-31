
import { useState } from 'react';
import { CheckoutFormState } from './checkout/types';
import { formatCPF, formatPhone, formatCEP } from './checkout/formatters';
import { validateCheckoutForm } from './checkout/validator';
import { useCepLookup } from './checkout/useCepLookup';

export function useCheckoutForm() {
  const [formState, setFormState] = useState<CheckoutFormState>({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    formErrors: {},
    selectedShipping: null,
    deliveryEstimate: null,
  });

  // Field updater functions
  const setFullName = (value: string) => 
    setFormState(prev => ({ ...prev, fullName: value }));
  
  const setEmail = (value: string) => 
    setFormState(prev => ({ ...prev, email: value }));
  
  const setCpf = (value: string) => 
    setFormState(prev => ({ ...prev, cpf: formatCPF(value) }));
  
  const setPhone = (value: string) => 
    setFormState(prev => ({ ...prev, phone: formatPhone(value) }));
  
  const setCep = (value: string) => 
    setFormState(prev => ({ ...prev, cep: formatCEP(value) }));
  
  const setStreet = (value: string) => 
    setFormState(prev => ({ ...prev, street: value }));
  
  const setNumber = (value: string) => 
    setFormState(prev => ({ ...prev, number: value }));
  
  const setComplement = (value: string) => 
    setFormState(prev => ({ ...prev, complement: value }));
  
  const setNeighborhood = (value: string) => 
    setFormState(prev => ({ ...prev, neighborhood: value }));
  
  const setCity = (value: string) => 
    setFormState(prev => ({ ...prev, city: value }));
  
  const setState = (value: string) => 
    setFormState(prev => ({ ...prev, state: value }));

  const setFormErrors = (errors: Record<string, string>) => 
    setFormState(prev => ({ ...prev, formErrors: errors }));

  const setSelectedShipping = (value: string | null) =>
    setFormState(prev => ({ ...prev, selectedShipping: value }));
    
  const setDeliveryEstimate = (value: string | null) =>
    setFormState(prev => ({ ...prev, deliveryEstimate: value }));

  // Use the CEP lookup hook
  const { isSearchingCep, handleCepChange } = useCepLookup({
    formState,
    setFormState,
    setFormErrors
  });

  // Form validation
  const validateForm = () => {
    const errors = validateCheckoutForm(formState);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return {
    formState,
    isSearchingCep,
    setFullName,
    setEmail,
    setCpf,
    setPhone,
    setCep,
    setStreet,
    setNumber,
    setComplement,
    setNeighborhood,
    setCity,
    setState,
    setSelectedShipping,
    handleCepChange,
    validateForm
  };
}
