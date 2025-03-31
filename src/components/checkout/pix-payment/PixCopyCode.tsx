
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PixCopyCodeProps {
  pixCode: string;
  buttonStyle?: React.CSSProperties;
  buttonText?: string;
}

const PixCopyCode: React.FC<PixCopyCodeProps> = ({ 
  pixCode, 
  buttonStyle, 
  buttonText = "Copiar Código PIX" 
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código copiado",
        description: "O código PIX foi copiado para a área de transferência",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="w-full mb-4">
        <p className="text-xs text-gray-500 mb-2">Código PIX (Copia e Cola):</p>
        <div className="relative">
          <div className="p-3 bg-gray-50 border rounded-md text-gray-800 text-xs font-mono break-all">
            {pixCode}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button
        onClick={copyToClipboard}
        className="w-full text-white mb-4"
        style={buttonStyle}
      >
        <Copy className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </>
  );
};

export default PixCopyCode;
