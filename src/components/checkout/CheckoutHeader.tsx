
import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

const CheckoutHeader = () => {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 14,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          clearInterval(timer);
          return { minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="bg-gradient-to-r from-black to-gray-800 text-white py-3 px-4 text-center">
        <div className="max-w-5xl mx-auto flex justify-center items-center space-x-3">
          <Clock className="h-5 w-5 text-yellow-400" />
          <div className="text-sm md:text-base">
            Oferta por tempo limitado! <span className="font-bold">{formatTime(timeLeft.minutes, timeLeft.seconds)}</span>
          </div>
        </div>
      </header>
      
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-3">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-base md:text-lg font-bold mb-2 md:mb-0">+ DE 50.000 CONTEÚDOS</div>
          <div className="flex items-center space-x-2 text-xs md:text-sm bg-black/20 rounded-full px-4 py-1.5">
            <Clock className="h-4 w-4" />
            <span>Termina em {formatTime(timeLeft.minutes, timeLeft.seconds)}</span>
          </div>
        </div>
      </div>
      
      <div className="py-4 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between">
            <span className="font-medium text-sm md:text-base">PREENCHA SEUS DADOS ABAIXO</span>
            <div className="flex items-center text-green-600 text-xs">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>Pagamento Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutHeader;
