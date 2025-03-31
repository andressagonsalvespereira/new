
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatCEP } from './formatters';
import { CheckoutFormState } from './types';

interface UseCepLookupProps {
  formState: CheckoutFormState;
  setFormState: React.Dispatch<React.SetStateAction<CheckoutFormState>>;
  setFormErrors: (errors: Record<string, string>) => void;
}

export function useCepLookup({ formState, setFormState, setFormErrors }: UseCepLookupProps) {
  const { toast } = useToast();
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  /**
   * Handles CEP input change and fetches address data
   */
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    
    // Update the CEP in the form state
    setFormState(prev => ({ ...prev, cep: formattedCep }));
    
    if (formattedCep.replace(/\D/g, '').length === 8) {
      setIsSearchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formattedCep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormState(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
            selectedShipping: 'free',
          }));
          
          // Calculate estimated delivery date
          const today = new Date();
          // Add 5-10 business days (simple approximation)
          const deliveryDate = new Date(today);
          deliveryDate.setDate(today.getDate() + 7); // Average of 7 days
          
          const formattedDate = deliveryDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          setFormState(prev => ({
            ...prev,
            deliveryEstimate: `Chegará em ${formattedDate}`
          }));
          
          // Clear previous errors for these fields
          const newErrors = {...formState.formErrors};
          delete newErrors.cep;
          delete newErrors.street;
          delete newErrors.neighborhood;
          delete newErrors.city;
          delete newErrors.state;
          setFormErrors(newErrors);
          
          toast({
            title: "CEP encontrado",
            description: "Endereço preenchido automaticamente",
            duration: 3000,
          });
        } else {
          setFormErrors({ ...formState.formErrors, cep: 'CEP não encontrado' });
          toast({
            title: "CEP não encontrado",
            description: "Por favor, verifique o CEP informado ou preencha o endereço manualmente",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setFormErrors({ ...formState.formErrors, cep: 'Erro ao buscar CEP' });
        toast({
          title: "Erro ao buscar CEP",
          description: "Houve um problema ao consultar o CEP. Por favor, preencha o endereço manualmente",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  return {
    isSearchingCep,
    handleCepChange
  };
}
