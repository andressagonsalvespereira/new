import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Copy, Loader2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import asaasService from '@/services/asaasService';

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
        try {
          // Em uma implementação real, isso seria uma chamada à API do Asaas
          // const customer = await asaasService.createCustomer(customerData, isSandbox);
          // const payment = await asaasService.createPixPayment(paymentData, isSandbox);
          // const pixQrCode = await asaasService.getPixQRCode(payment.id, isSandbox);
          
          // Simulação de dados para demonstração
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const mockPixData = {
            qrCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
            qrCodeImage: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
            expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            paymentId: 'pay_' + Math.random().toString(36).substr(2, 9)
          };
          
          setPixData(mockPixData);
          
          // Enviar dados do pagamento para processamento
          onSubmit({
            method: 'pix',
            paymentId: mockPixData.paymentId,
            status: 'PENDING',
            qrCode: mockPixData.qrCode,
            qrCodeImage: mockPixData.qrCodeImage,
            expirationDate: mockPixData.expirationDate,
            timestamp: new Date().toISOString()
          });
          
        } catch (error) {
          console.error('Error generating PIX QR code:', error);
          setError('Erro ao gerar QR Code PIX. Por favor, tente novamente.');
          toast({
            title: "Erro no processamento",
            description: "Houve um problema ao gerar o QR Code PIX. Por favor, tente novamente.",
            variant: "destructive",
            duration: 5000,
          });
        } finally {
          setIsLoading(false);
        }
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

      <div className="w-64 h-64 bg-white p-2 border rounded-lg mb-4 flex items-center justify-center">
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
