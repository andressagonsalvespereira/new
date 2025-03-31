
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import asaasService from '@/services/asaasService';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';

interface PixPaymentProps {
  onSubmit: (data: any) => void;
  isSandbox: boolean;
}

const PixPayment = ({ onSubmit, isSandbox }: PixPaymentProps) => {
  const { toast } = useToast();
  const { formState } = useCheckoutForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleGenerateQRCode = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the Asaas API
      // First create a customer
      const customerData = {
        name: formState.fullName,
        email: formState.email,
        cpfCnpj: formState.cpf.replace(/[^\d]/g, ''),
        phone: formState.phone.replace(/[^\d]/g, ''),
        address: formState.street,
        addressNumber: formState.number,
        complement: formState.complement,
        province: formState.neighborhood,
        postalCode: formState.cep.replace(/[^\d]/g, ''),
        city: formState.city,
        state: formState.state
      };

      // Simulate customer creation for demo
      // const customer = await asaasService.createCustomer(customerData, isSandbox);
      const customer = { id: 'cus_000005118652' }; // Simulated customer ID
      
      // Then create a payment with PIX
      const today = new Date();
      const dueDate = new Date(today.setDate(today.getDate() + 1))
        .toISOString().split('T')[0];
      
      const paymentData = {
        customer: customer.id,
        billingType: 'PIX' as const,
        value: 120.00,
        dueDate: dueDate,
        description: 'Sua compra na loja'
      };

      // Simulate payment creation for demo
      // const payment = await asaasService.createPayment(paymentData, isSandbox);
      const payment = { 
        id: 'pay_000012345678',
        status: 'PENDING'
      }; // Simulated payment response
      
      setPaymentId(payment.id);
      
      // Get the PIX QR code
      // In a real implementation, uncomment this code
      // const pixQrCode = await asaasService.getPixQrCode(payment.id, isSandbox);
      // setQrCodeImage(`data:image/png;base64,${pixQrCode.encodedImage}`);
      // setPixCopiaECola(pixQrCode.payload);
      
      // Simulate QR code for demo
      setQrCodeImage('/placeholder.svg');
      setPixCopiaECola('00020101021226880014br.gov.bcb.pix2566qrcode-pix.asaas.com/pixs/42b639b0-ca4b-441c-8a94-aca45aacc5050215Pagamento9953040000530398654071.005802BR5925Test Name6008Sao Paulo62070503***6304D3FF');
      
      setPixGenerated(true);
      
      toast({
        title: "Código PIX gerado com sucesso",
        description: "Utilize o QR code ou a chave PIX para realizar o pagamento",
        duration: 5000,
      });
      
      onSubmit({
        method: 'pix',
        paymentId: payment.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating PIX QR code:', error);
      toast({
        title: "Erro ao gerar código PIX",
        description: "Houve um problema ao gerar o código PIX. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPixKey = () => {
    if (pixCopiaECola) {
      navigator.clipboard.writeText(pixCopiaECola);
      setCopied(true);
      
      toast({
        title: "Chave PIX copiada",
        description: "A chave PIX foi copiada para a área de transferência",
        duration: 3000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;
    
    setIsCheckingPayment(true);
    try {
      // In a real implementation, this would check the payment status
      // const paymentInfo = await asaasService.checkPaymentStatus(paymentId, isSandbox);
      // setPaymentStatus(paymentInfo.status);
      
      // Simulate payment status check
      await new Promise(resolve => setTimeout(resolve, 1500));
      const simulatedStatus = Math.random() > 0.5 ? 'RECEIVED' : 'PENDING';
      setPaymentStatus(simulatedStatus);
      
      if (simulatedStatus === 'RECEIVED') {
        toast({
          title: "Pagamento recebido!",
          description: "Seu pagamento foi confirmado com sucesso.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Pagamento pendente",
          description: "Ainda não identificamos seu pagamento. Por favor, aguarde ou tente novamente.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast({
        title: "Erro ao verificar pagamento",
        description: "Não foi possível verificar o status do pagamento no momento.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCheckingPayment(false);
    }
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
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando código...
              </>
            ) : (
              'Gerar Código PIX'
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="w-48 h-48 bg-white flex items-center justify-center mb-4 rounded-lg border-2 border-dashed border-gray-300 relative p-4">
            {qrCodeImage && (
              <img 
                src={qrCodeImage} 
                alt="QR Code PIX" 
                className="max-w-full max-h-full"
              />
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 w-full max-w-md mb-6">
            <p className="text-sm text-gray-600 mb-2">Chave PIX:</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
              <span className="text-sm font-mono text-gray-800 truncate mr-2">
                {pixCopiaECola ? pixCopiaECola.substring(0, 30) + '...' : '...'}
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
          
          {paymentStatus === 'RECEIVED' ? (
            <Alert className="mb-6 max-w-md bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Pagamento confirmado! Obrigado pela sua compra.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert variant="default" className="mb-4 max-w-md bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Após o pagamento, clique no botão abaixo para verificar se seu pagamento foi recebido.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingPayment}
                className="w-full max-w-md mb-6"
                variant="outline"
              >
                {isCheckingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando pagamento...
                  </>
                ) : (
                  'Verificar Pagamento'
                )}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PixPayment;
