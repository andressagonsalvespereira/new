
import React from 'react';
import AddressInput from '../AddressInput';

interface AddressFormFieldsProps {
  street: string;
  setStreet: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  complement: string;
  setComplement: (value: string) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

const AddressFormFields = ({
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
  errors,
  disabled = false
}: AddressFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AddressInput
          id="street"
          label="Rua"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Rua/Avenida"
          error={errors.street}
          disabled={disabled}
        />
        
        <AddressInput
          id="number"
          label="Número"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="123"
          error={errors.number}
          disabled={disabled}
        />
      </div>
      
      <AddressInput
        id="complement"
        label="Complemento (opcional)"
        value={complement}
        onChange={(e) => setComplement(e.target.value)}
        placeholder="Apto, Bloco, etc"
        disabled={disabled}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AddressInput
          id="neighborhood"
          label="Bairro"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder="Bairro"
          error={errors.neighborhood}
          disabled={disabled}
        />
        
        <AddressInput
          id="city"
          label="Cidade"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Cidade"
          error={errors.city}
          disabled={disabled}
        />
        
        <AddressInput
          id="state"
          label="Estado"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="UF"
          error={errors.state}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default AddressFormFields;
