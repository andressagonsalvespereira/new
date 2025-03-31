
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

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
    </>
  );
};

export default CheckoutHeader;
