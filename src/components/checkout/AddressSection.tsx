
import React from 'react';
import { Input } from '@/components/ui/input';
import CustomerReviews from './CustomerReviews';

interface AddressSectionProps {
  cep: string;
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  street: string;
  setStreet: React.Dispatch<React.SetStateAction<string>>;
  number: string;
  setNumber: React.Dispatch<React.SetStateAction<string>>;
  complement: string;
  setComplement: React.Dispatch<React.SetStateAction<string>>;
  neighborhood: string;
  setNeighborhood: React.Dispatch<React.SetStateAction<string>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
  formErrors: Record<string, string>;
}

const AddressSection = ({
  cep,
  handleCepChange,
  street,
  setStreet,
  number,
  setNumber,
  complement,
  setComplement,
  neighborhood,
  setNeighborhood,
  city,
  setCity,
  state,
  setState,
  formErrors
}: AddressSectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</div>
        <h2 className="font-medium">Endereço</h2>
        <div className="ml-auto text-xs text-gray-500">3 informações</div>
      </div>
      
      <div className="space-y-4 px-2">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="cep" className="block text-sm mb-1">CEP</label>
            <Input
              id="cep"
              value={cep}
              onChange={handleCepChange}
              className={`h-9 ${formErrors.cep ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="00000-000"
            />
            {formErrors.cep && <p className="text-red-500 text-xs mt-1">{formErrors.cep}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="street" className="block text-sm mb-1">Endereço</label>
            <Input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={`h-9 ${formErrors.street ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Rua, Avenida, etc."
            />
            {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
          </div>
          <div>
            <label htmlFor="number" className="block text-sm mb-1">Número</label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={`h-9 ${formErrors.number ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="123"
            />
            {formErrors.number && <p className="text-red-500 text-xs mt-1">{formErrors.number}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="complement" className="block text-sm mb-1">Complemento (opcional)</label>
            <Input
              id="complement"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              className="h-9 border-gray-300"
              placeholder="Apto, Bloco, Casa, etc."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="neighborhood" className="block text-sm mb-1">Bairro</label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className={`h-9 ${formErrors.neighborhood ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Seu bairro"
            />
            {formErrors.neighborhood && <p className="text-red-500 text-xs mt-1">{formErrors.neighborhood}</p>}
          </div>
          <div>
            <label htmlFor="city" className="block text-sm mb-1">Cidade</label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`h-9 ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Sua cidade"
            />
            {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
          </div>
          <div>
            <label htmlFor="state" className="block text-sm mb-1">Estado</label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={`h-9 ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="UF"
            />
            {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
          </div>
        </div>
      </div>
      
      <CustomerReviews />
    </div>
  );
};

export default AddressSection;
