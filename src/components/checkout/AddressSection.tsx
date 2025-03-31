
import React from 'react';
import { Input } from '@/components/ui/input';
import { CircleAlert, Loader2 } from 'lucide-react';

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
  isSearchingCep?: boolean;
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
  formErrors,
  isSearchingCep = false
}: AddressSectionProps) => {
  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</div>
        <h2 className="font-medium text-lg">Endereço de Entrega</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="relative">
            <label htmlFor="cep" className="block text-sm mb-1">CEP</label>
            <div className="relative">
              <Input
                id="cep"
                value={cep}
                onChange={handleCepChange}
                className={`h-9 pr-10 ${formErrors.cep ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="00000-000"
                disabled={isSearchingCep}
              />
              {isSearchingCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              )}
            </div>
            {formErrors.cep && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <CircleAlert className="h-3 w-3 mr-1" />
                {formErrors.cep}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Digite o CEP para buscar o endereço automaticamente ou preencha manualmente.
            </p>
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
              disabled={isSearchingCep}
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
              disabled={isSearchingCep}
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
              disabled={isSearchingCep}
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
              disabled={isSearchingCep}
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
              disabled={isSearchingCep}
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
              disabled={isSearchingCep}
            />
            {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
