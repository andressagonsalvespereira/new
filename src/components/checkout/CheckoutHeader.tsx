
import React from 'react';
import { Clock } from 'lucide-react';

const CheckoutHeader = () => {
  return (
    <>
      <header className="bg-black text-white py-2 px-4 flex justify-center items-center">
        <div className="text-sm">Oferta disponível por tempo limitado: <span className="font-bold">00:14:46</span></div>
      </header>
      
      <div className="bg-red-700 text-white py-2 px-4 flex justify-between items-center">
        <div className="text-sm">+ DE 50.000</div>
        <div className="text-sm font-bold">CONTEÚDOS</div>
      </div>
      
      <div className="bg-red-700 py-3">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between bg-black rounded-md p-2 text-white">
            <p className="text-xs">Oferta por tempo limitado! Garanta o seu acesso:</p>
            <div className="flex items-center space-x-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>Termina em 00:14:45</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-2 px-4 bg-gray-100 text-center text-sm">
        <div className="max-w-xl mx-auto bg-white border rounded-md shadow-sm p-3 flex items-center justify-center">
          <span className="font-bold">PREENCHA SEUS DADOS ABAIXO</span>
        </div>
      </div>
    </>
  );
};

export default CheckoutHeader;
