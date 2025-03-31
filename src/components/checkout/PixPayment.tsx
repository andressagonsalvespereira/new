
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="mr-2 h-5 w-5" />
          Pagamento via PIX
        </CardTitle>
        <CardDescription>
          Gere um código PIX para realizar o pagamento instantâneo
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {!pixGenerated ? (
          <>
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mb-4 rounded-lg border border-gray-200">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-center text-sm text-gray-500 mb-6 max-w-md">
              Clique no botão abaixo para gerar um código PIX. 
              Você poderá escanear o QR code ou copiar a chave PIX para realizar o pagamento.
            </p>
            <Button
              onClick={handleGenerateQRCode}
              disabled={isGenerating}
              className="w-full max-w-xs"
            >
              {isGenerating ? 'Gerando código...' : 'Gerar Código PIX'}
            </Button>
          </>
        ) : (
          <>
            <div className="w-48 h-48 bg-white flex items-center justify-center mb-4 rounded-lg border-2 border-dashed border-gray-300 relative">
              {/* This would be an actual QR code in production */}
              <QrCode className="h-24 w-24 text-black" />
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 hidden">
                <div className="text-xs text-center p-2 bg-black text-white rounded">
                  QR code real seria exibido aqui
                </div>
              </div>
            </div>
            
            <Alert variant="default" className="mb-4 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este QR code é apenas para demonstração. Em um ambiente real, ele seria gerado pelo gateway de pagamento.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 w-full max-w-md mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Chave PIX:</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2 font-mono">{pixKey.substring(0, 12)}...</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2" 
                    onClick={handleCopyPixKey}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center w-full max-w-md">
              <div>
                <p className="font-medium">Total:</p>
                <p className="text-2xl font-bold">R$120,00</p>
              </div>
              <Button onClick={handleGenerateQRCode} variant="outline">
                Gerar Novo Código
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PixPayment;
