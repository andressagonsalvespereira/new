import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

export function useCheckoutForm() {
  const { toast } = useToast();
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
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Formatting functions
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2').substring(0, 9);
  };

  // Field updaters with formatting
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

  // Address search functionality
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    setCep(formattedCep);
    
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
          
          // Calcular prazo de entrega estimado
          const today = new Date();
          // Adicionar 5-10 dias úteis (simples)
          const deliveryDate = new Date(today);
          deliveryDate.setDate(today.getDate() + 7); // Média de 7 dias
          
          const formattedDate = deliveryDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          setDeliveryEstimate(`Chegará em ${formattedDate}`);
          
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

  const validateForm = () => {
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
