
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleAlert, Loader2, Truck, Package, CheckCircle2 } from 'lucide-react';
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
        <div className="relative">
          <Label htmlFor="cep" className="mb-2 block">CEP</Label>
          <Input 
            id="cep" 
            value={cep}
            onChange={handleCepChange}
            className={`border ${errors.cep ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="00000-000"
            disabled={isCompleted}
          />
          {isLoading && (
            <div className="absolute right-3 top-9">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {errors.cep && (
            <div className="text-red-500 text-xs mt-1 flex items-center">
              <CircleAlert className="h-3 w-3 mr-1" />
              {errors.cep}
            </div>
          )}
        </div>
        
        {showShippingOptions && (
          <div className="bg-green-50 border border-green-100 rounded-md p-4 my-4">
            <h3 className="font-medium text-green-800 mb-3 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Opções de Entrega
            </h3>
            
            <div 
              className={`border rounded-md p-3 mb-3 flex items-start cursor-pointer transition-colors ${
                selectedShipping === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => selectShippingOption('free')}
            >
              <div className={`rounded-full border flex-shrink-0 w-5 h-5 flex items-center justify-center mr-2 mt-0.5 ${
                selectedShipping === 'free' ? 'border-green-500 bg-green-500' : 'border-gray-400'
              }`}>
                {selectedShipping === 'free' && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-grow">
                <div className="font-medium">Frete Grátis</div>
                <div className="text-sm text-gray-600 flex items-center">
                  <Package className="h-4 w-4 mr-1 text-gray-500" />
                  Prazo de entrega: 5-10 dias úteis
                </div>
              </div>
              <div className="text-green-600 font-bold">
                R$ 0,00
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="street" className="mb-2 block">Rua</Label>
            <Input 
              id="street" 
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={`border ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Rua/Avenida"
              disabled={isCompleted}
            />
            {errors.street && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <CircleAlert className="h-3 w-3 mr-1" />
                {errors.street}
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="number" className="mb-2 block">Número</Label>
            <Input 
              id="number" 
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={`border ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="123"
              disabled={isCompleted}
            />
            {errors.number && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <CircleAlert className="h-3 w-3 mr-1" />
                {errors.number}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="complement" className="mb-2 block">Complemento (opcional)</Label>
          <Input 
            id="complement" 
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            className="border border-gray-300"
            placeholder="Apto, Bloco, etc"
            disabled={isCompleted}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="mb-2 block">Bairro</Label>
            <Input 
              id="neighborhood" 
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className={`border ${errors.neighborhood ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Bairro"
              disabled={isCompleted}
            />
            {errors.neighborhood && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <CircleAlert className="h-3 w-3 mr-1" />
                {errors.neighborhood}
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="city" className="mb-2 block">Cidade</Label>
            <Input 
              id="city" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`border ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Cidade"
              disabled={isCompleted}
            />
            {errors.city && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <CircleAlert className="h-3 w-3 mr-1" />
                {errors.city}
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="state" className="mb-2 block">Estado</Label>
            <Input 
              id="state" 
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={`border ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="UF"
              disabled={isCompleted}
            />
            {errors.state && (
              <div className="text-red-500 text-xs mt-1 flex items-center">
                <CircleAlert className="h-3 w-3 mr-1" />
                {errors.state}
              </div>
            )}
          </div>
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
