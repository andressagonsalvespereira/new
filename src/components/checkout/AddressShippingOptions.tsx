
import React from 'react';
import { Truck, Package, CheckCircle2, CalendarClock } from 'lucide-react';

interface AddressShippingOptionsProps {
  selectedShipping: string | null;
  onSelectShipping: (option: string) => void;
  deliveryEstimate: string | null;
}

const AddressShippingOptions = ({ 
  selectedShipping, 
  onSelectShipping,
  deliveryEstimate
}: AddressShippingOptionsProps) => {
  // Don't render anything if no shipping option is selected
  if (!selectedShipping) return null;

  return (
    <div className="bg-white border border-green-100 rounded-md p-4 mt-4 shadow-sm">
      <h3 className="font-medium text-green-800 mb-3 flex items-center">
        <Truck className="h-5 w-5 mr-2 text-green-600" />
        Opções de Entrega
      </h3>
      
      <div 
        className={`border rounded-md p-4 mb-2 flex items-start cursor-pointer transition-all ${
          selectedShipping === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
        }`}
        onClick={() => onSelectShipping('free')}
      >
        <div className={`rounded-full border flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3 mt-0.5 ${
          selectedShipping === 'free' ? 'border-green-500 bg-green-500' : 'border-gray-400'
        }`}>
          {selectedShipping === 'free' && <CheckCircle2 className="h-4 w-4 text-white" />}
        </div>
        <div className="flex-grow">
          <div className="font-medium text-gray-800">Frete Grátis</div>
          {deliveryEstimate && (
            <div className="text-sm text-green-600 flex items-center mt-2 font-medium bg-green-50 p-2 rounded-md border border-green-100">
              <CalendarClock className="h-4 w-4 mr-1 text-green-500" />
              <span>{deliveryEstimate}</span>
            </div>
          )}
        </div>
        <div className="text-green-600 font-bold flex items-center">
          <span className="text-xs line-through text-gray-400 mr-1">R$ 15,00</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">GRÁTIS</span>
        </div>
      </div>
    </div>
  );
};

export default AddressShippingOptions;
