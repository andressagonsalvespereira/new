
import React from 'react';

interface AddressFormHeaderProps {
  isCompleted: boolean;
}

const AddressFormHeader: React.FC<AddressFormHeaderProps> = ({ isCompleted }) => {
  return (
    <div className="bg-black text-white p-3 mb-4 flex items-center">
      <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-green-600 text-white mr-2">
        2
      </span>
      <h2 className="font-medium text-lg">Endereço de Cobrança</h2>
    </div>
  );
};

export default AddressFormHeader;
