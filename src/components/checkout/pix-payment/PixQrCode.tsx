
import React from 'react';
import { QrCode } from 'lucide-react';

interface PixQrCodeProps {
  qrCodeImage: string | null;
}

const PixQrCode: React.FC<PixQrCodeProps> = ({ qrCodeImage }) => {
  return (
    <div className="w-48 h-48 bg-white p-2 border rounded-lg mb-4 flex items-center justify-center">
      {qrCodeImage ? (
        <img 
          src={qrCodeImage} 
          alt="QR Code PIX" 
          className="w-full h-full"
        />
      ) : (
        <QrCode className="w-12 h-12 text-gray-400" />
      )}
    </div>
  );
};

export default PixQrCode;
