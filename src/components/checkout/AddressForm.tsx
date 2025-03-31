
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import AddressFinder from './address/AddressFinder';
import AddressFormFields from './address/AddressFormFields';
import AddressShippingOptions from './AddressShippingOptions';
import { Button } from '@/components/ui/button';

interface AddressFormProps {
  onSubmit: (data: AddressData) => void;
  isCompleted: boolean;
}

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  shippingOption?: string;
}

const AddressForm = ({ onSubmit, isCompleted }: AddressFormProps) => {
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2').substring(0, 9);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    setCep(formattedCep);
    
    if (formattedCep.replace(/\D/g, '').length === 8) {
      setIsLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formattedCep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          
          const newErrors = {...errors};
          delete newErrors.street;
          delete newErrors.neighborhood;
          delete newErrors.city;
          delete newErrors.state;
          setErrors(newErrors);
          
          setShowShippingOptions(true);
          setSelectedShipping('free');
          
          const today = new Date();
          const deliveryDate = new Date(today);
          deliveryDate.setDate(today.getDate() + 7);
          
          const formattedDate = deliveryDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          setDeliveryEstimate(`Chegará em ${formattedDate}`);
        } else {
          setErrors(prev => ({...prev, cep: 'CEP não encontrado'}));
          setShowShippingOptions(false);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setErrors(prev => ({...prev, cep: 'Erro ao buscar CEP'}));
        setShowShippingOptions(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowShippingOptions(false);
    }
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP inválido';
    }
    
    if (!street.trim()) newErrors.street = 'Rua é obrigatória';
    if (!number.trim()) newErrors.number = 'Número é obrigatório';
    if (!neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!state.trim()) newErrors.state = 'Estado é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateFields()) {
      onSubmit({
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        shippingOption: selectedShipping || undefined
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(e.target.value);
    if (e.target.value.trim() && street && neighborhood && city && state) {
      setShowShippingOptions(true);
      setSelectedShipping('free');
      
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + 7);
      
      const formattedDate = deliveryDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      setDeliveryEstimate(`Chegará em ${formattedDate}`);
    }
  };

  const selectShippingOption = (option: string) => {
    setSelectedShipping(option);
  };

  return (
    <div className={`transition-all duration-300 ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="bg-black text-white p-3 mb-4 flex items-center">
        <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-green-600 text-white mr-2">
          2
        </span>
        <h2 className="font-medium text-lg">Endereço de Cobrança</h2>
      </div>
      
      <div className="p-4 bg-white rounded-md mb-6 space-y-4">
        <AddressFinder 
          cep={cep} 
          onChange={handleCepChange} 
          error={errors.cep} 
          isLoading={isLoading}
          disabled={isCompleted}
        />
        
        <AddressFormFields 
          street={street}
          setStreet={setStreet}
          number={number}
          setNumber={handleNumberChange}
          complement={complement}
          setComplement={setComplement}
          neighborhood={neighborhood}
          setNeighborhood={setNeighborhood}
          city={city}
          setCity={setCity}
          state={state}
          setState={setState}
          errors={errors}
          disabled={isCompleted}
        />
        
        {showShippingOptions && (
          <AddressShippingOptions
            selectedShipping={selectedShipping}
            onSelectShipping={selectShippingOption}
            deliveryEstimate={deliveryEstimate}
          />
        )}
        
        {!isCompleted && (
          <Button 
            onClick={handleContinue}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
