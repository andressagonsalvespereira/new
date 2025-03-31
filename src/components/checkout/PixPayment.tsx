
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Copy, Loader2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processPixPayment } from './utils/payment/pixProcessor';
import { PaymentResult } from './utils/payment/types';

interface PixPaymentProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
}

const PixPayment = ({ onSubmit, isSandbox }: PixPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeImage: string;
    expirationDate: string;
    paymentId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Gerar QR Code PIX
  useEffect(() => {
    const generatePixQrCode = async () => {
      if (!pixData) {
        setIsLoading(true);
        
        // Processar pagamento PIX
        await processPixPayment(
          {
            formState: {}, // formState não é usado no processamento PIX simulado
            settings: {
              isEnabled: true,
              apiKey: '',
              allowPix: true,
              allowCreditCard: true,
              manualCreditCard: false,
              sandboxMode: isSandbox
            },
            isSandbox,
            onSubmit
          },
          (paymentData: PaymentResult) => {
            // Extrair dados do PIX do resultado
            setPixData({
              qrCode: paymentData.qrCode as string,
              qrCodeImage: paymentData.qrCodeImage as string,
              expirationDate: paymentData.expirationDate as string,
              paymentId: paymentData.paymentId
            });
          },
          (errorMessage: string) => {
            setError(errorMessage);
            toast({
              title: "Erro no processamento",
              description: errorMessage,
              variant: "destructive",
              duration: 5000,
            });
          }
        );
        
        setIsLoading(false);
      }
    };
    
    generatePixQrCode();
  }, [isSandbox, onSubmit, toast, pixData]);

  const copyToClipboard = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast({
        title: "Código copiado",
        description: "O código PIX foi copiado para a área de transferência",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p>Gerando QR Code PIX...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!pixData) {
    return null;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-center">
        <h3 className="font-medium mb-2">Pague com PIX</h3>
        <p className="text-sm text-gray-600">
          Escaneie o QR Code abaixo com o app do seu banco ou copie o código PIX
        </p>
      </div>

      <div className="w-48 h-48 bg-white p-2 border rounded-lg mb-4 flex items-center justify-center">
        {pixData.qrCodeImage ? (
          <img 
            src={pixData.qrCodeImage} 
            alt="QR Code PIX" 
            className="w-full h-full"
          />
        ) : (
          <QrCode className="w-12 h-12 text-gray-400" />
        )}
      </div>

      <div className="w-full mb-4">
        <p className="text-xs text-gray-500 mb-2">Código PIX (Copia e Cola):</p>
        <div className="relative">
          <div className="p-3 bg-gray-50 border rounded-md text-gray-800 text-xs font-mono break-all">
            {pixData.qrCode}
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
        className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar Código PIX
      </Button>

      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          O pagamento via PIX é instantâneo. Após o pagamento, você receberá a confirmação em seu e-mail.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PixPayment;
