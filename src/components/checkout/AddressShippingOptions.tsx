
import React from 'react';
import { Truck, Package, CheckCircle2, CalendarClock } from 'lucide-react';

interface AddressShippingOptionsProps {
  selectedShipping: string | null;
  onSelectShipping: (option: string) => void;
}

const AddressShippingOptions = ({ 
  selectedShipping, 
  onSelectShipping 
}: AddressShippingOptionsProps) => {
  return (
    <div className="bg-green-50 border border-green-100 rounded-md p-4 my-4">
      <h3 className="font-medium text-green-800 mb-3 flex items-center">
        <Truck className="h-5 w-5 mr-2" />
        Opções de Entrega
      </h3>
      
      <div 
        className={`border rounded-md p-3 mb-3 flex items-start cursor-pointer transition-colors ${
          selectedShipping === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
        }`}
        onClick={() => onSelectShipping('free')}
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
          <div className="text-sm text-gray-600 flex items-center mt-1">
            <CalendarClock className="h-4 w-4 mr-1 text-gray-500" />
            Chegará em até 10 dias úteis
          </div>
        </div>
        <div className="text-green-600 font-bold">
          R$ 0,00
        </div>
      </div>
    </div>
  );
};

export default AddressShippingOptions;
