
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import AddressInput from './AddressInput';
import AddressShippingOptions from './AddressShippingOptions';

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
          
          // Clear previous errors for these fields
          const newErrors = {...errors};
          delete newErrors.street;
          delete newErrors.neighborhood;
          delete newErrors.city;
          delete newErrors.state;
          setErrors(newErrors);
          
          // Show shipping options after valid CEP
          setShowShippingOptions(true);
          setSelectedShipping('free');
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
    
    if (!street.trim()) {
      newErrors.street = 'Rua é obrigatória';
    }
    
    if (!number.trim()) {
      newErrors.number = 'Número é obrigatório';
    }
    
    if (!neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }
    
    if (!city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }
    
    if (!state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }
    
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

  const selectShippingOption = (option: string) => {
    setSelectedShipping(option);
  };

  return (
    <div className={`transition-all duration-300 ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="bg-black text-white p-3 mb-4 flex items-center">
        <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-red-600 text-white mr-2">
          2
        </span>
        <h2 className="font-medium text-lg">Endereço de Cobrança</h2>
      </div>
      
      <div className="p-4 bg-white rounded-md mb-6 space-y-4">
        <AddressInput
          id="cep"
          label="CEP"
          value={cep}
          onChange={handleCepChange}
          placeholder="00000-000"
          error={errors.cep}
          disabled={isCompleted}
          isLoading={isLoading}
        />
        
        {showShippingOptions && (
          <AddressShippingOptions
            selectedShipping={selectedShipping}
            onSelectShipping={selectShippingOption}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AddressInput
            id="street"
            label="Rua"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua/Avenida"
            error={errors.street}
            disabled={isCompleted}
          />
          
          <AddressInput
            id="number"
            label="Número"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="123"
            error={errors.number}
            disabled={isCompleted}
          />
        </div>
        
        <AddressInput
          id="complement"
          label="Complemento (opcional)"
          value={complement}
          onChange={(e) => setComplement(e.target.value)}
          placeholder="Apto, Bloco, etc"
          disabled={isCompleted}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AddressInput
            id="neighborhood"
            label="Bairro"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Bairro"
            error={errors.neighborhood}
            disabled={isCompleted}
          />
          
          <AddressInput
            id="city"
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Cidade"
            error={errors.city}
            disabled={isCompleted}
          />
          
          <AddressInput
            id="state"
            label="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="UF"
            error={errors.state}
            disabled={isCompleted}
          />
        </div>
        
        {!isCompleted && (
          <button 
            onClick={handleContinue}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
