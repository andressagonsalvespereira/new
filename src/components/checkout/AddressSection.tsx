
import React from 'react';
import { CircleAlert, Loader2, FileDigit } from 'lucide-react';
import AddressFields from '@/components/checkout/address/AddressFields';
import CepInput from '@/components/checkout/address/CepInput';
import AddressShippingOptions from '@/components/checkout/AddressShippingOptions';

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
  isDigitalProduct?: boolean;
  selectedShipping: string | null;
  setSelectedShipping: (option: string) => void;
  deliveryEstimate: string | null;
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
  isSearchingCep = false,
  isDigitalProduct = false,
  selectedShipping,
  setSelectedShipping,
  deliveryEstimate
}: AddressSectionProps) => {
  // Check if we should show shipping options (only when there's a valid address)
  const hasValidAddress = street && neighborhood && city && state && number;

  if (isDigitalProduct) {
    return (
      <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</div>
          <h2 className="font-medium text-lg">Endereço de Entrega</h2>
        </div>
        
        <div className="p-4 bg-gray-50 rounded flex items-center">
          <FileDigit className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-gray-700">
            Este é um produto digital. Não é necessário informar endereço de entrega.
          </p>
        </div>
      </div>
    );
  }

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
        
        {/* Only show shipping options when there's a valid address */}
        {hasValidAddress && selectedShipping && (
          <AddressShippingOptions
            selectedShipping={selectedShipping}
            onSelectShipping={setSelectedShipping}
            deliveryEstimate={deliveryEstimate}
          />
        )}
      </div>
    </div>
  );
};

export default AddressSection;
