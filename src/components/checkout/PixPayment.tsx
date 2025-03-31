
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface PixPaymentProps {
  onSubmit: (data: any) => void;
}

const PixPayment = ({ onSubmit }: PixPaymentProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixKey] = useState('abcdef12-3456-7890-abcd-ef1234567890');

  const handleGenerateQRCode = () => {
    setIsGenerating(true);
    
    // Simulate API call to generate PIX code
    setTimeout(() => {
      setIsGenerating(false);
      setPixGenerated(true);
      
      toast({
        title: "Código PIX gerado com sucesso",
        description: "Utilize o QR code ou a chave PIX para realizar o pagamento",
        duration: 5000,
      });
      
      onSubmit({
        method: 'pix',
        pixKey,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    
    toast({
      title: "Chave PIX copiada",
      description: "A chave PIX foi copiada para a área de transferência",
      duration: 3000,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {!pixGenerated ? (
        <>
          <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mb-4 rounded-lg border border-dashed border-gray-300">
            <QrCode className="h-16 w-16 text-gray-400" />
          </div>
          <p className="text-center text-sm text-gray-500 mb-6 max-w-md">
            Clique no botão abaixo para gerar um código PIX. 
            Você poderá escanear o QR code ou copiar a chave PIX para realizar o pagamento.
          </p>
          <Button
            onClick={handleGenerateQRCode}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-10"
          >
            {isGenerating ? 'Gerando código...' : 'Gerar Código PIX'}
          </Button>
        </>
      ) : (
        <>
          <div className="w-48 h-48 bg-white flex items-center justify-center mb-4 rounded-lg border-2 border-dashed border-gray-300 relative p-4">
            {/* This would be an actual QR code in production */}
            <QrCode className="h-32 w-32 text-black" />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 w-full max-w-md mb-6">
            <p className="text-sm text-gray-600 mb-2">Chave PIX:</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
              <span className="text-sm font-mono text-gray-800 truncate mr-2">
                {pixKey}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 border-gray-300" 
                onClick={handleCopyPixKey}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Você tem 30 minutos para concluir o pagamento com esta chave
            </p>
          </div>
          
          <Alert variant="default" className="mb-6 max-w-md bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Após o pagamento, enviaremos um email com a confirmação. Aguarde alguns instantes.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

export default PixPayment;
