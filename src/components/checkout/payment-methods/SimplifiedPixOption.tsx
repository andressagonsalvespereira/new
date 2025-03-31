
import React from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimplifiedPixOptionProps {
  onSubmit: () => void;
}

const SimplifiedPixOption: React.FC<SimplifiedPixOptionProps> = ({ onSubmit }) => {
  return (
    <div className="p-6 text-center">
      <div className="flex justify-center mb-4">
        <QrCode className="h-16 w-16 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
      <p className="text-gray-600 mb-4">
        Você será redirecionado para uma página de pagamento PIX após clicar no botão abaixo.
      </p>
      <Button
        onClick={onSubmit}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
      >
        Continuar para Pagamento PIX
      </Button>
    </div>
  );
};

export default SimplifiedPixOption;
