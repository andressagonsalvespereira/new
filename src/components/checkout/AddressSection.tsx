
import React from 'react';
import { CircleAlert, Loader2 } from 'lucide-react';
import AddressFields from '@/components/checkout/address/AddressFields';
import CepInput from '@/components/checkout/address/CepInput';

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
        <CepInput
          cep={cep}
          handleCepChange={handleCepChange}
          error={formErrors.cep}
          isSearchingCep={isSearchingCep}
        />
        
        <AddressFields
          street={street}
          setStreet={setStreet}
          number={number}
          setNumber={setNumber}
          complement={complement}
          setComplement={setComplement}
          neighborhood={neighborhood}
          setNeighborhood={setNeighborhood}
          city={city}
          setCity={setCity}
          state={state}
          setState={setState}
          formErrors={formErrors}
          isSearchingCep={isSearchingCep}
        />
      </div>
    </div>
  );
};

export default AddressSection;
