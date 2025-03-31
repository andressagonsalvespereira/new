
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { QrCode, Copy, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrders } from '@/contexts/OrderContext';
import { trackPurchase } from '@/services/pixelService';

interface LocationState {
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  product: {
    id: string;
    name: string;
    price: number;
  };
}

const PixPaymentManual = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addOrder } = useOrders();
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get data from navigation state or use default values
  const state = location.state as LocationState || {
    customer: {
      name: 'Cliente',
      email: 'cliente@exemplo.com',
      cpf: '000.000.000-00',
      phone: '(00) 00000-0000'
    },
    product: {
      id: 'prod-001',
      name: 'Produto',
      price: 39.90
    }
  };
  
  const { customer, product } = state;
  
  // Simulated PIX data
  const pixData = {
    qrCode: 'QR Code Simulado',
    pixKey: '11881232875', // Random PIX key example
    expirationDate: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  };
  
  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixData.pixKey);
    setIsCopied(true);
    toast({
      title: "Código PIX copiado!",
      description: "O código PIX foi copiado para a área de transferência.",
      duration: 3000,
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create an order with pending status
      const pixDetails = {
        qrCode: pixData.qrCode,
        qrCodeImage: '/lovable-uploads/db42b0b5-b7f2-4418-a818-b1dd1ef078cd.png', // Use the uploaded image
        expirationDate: pixData.expirationDate
      };
      
      await addOrder({
        customer: customer,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        paymentMethod: 'pix',
        paymentStatus: 'pending',
        pixDetails
      });
      
      // Track purchase event
      trackPurchase({
        value: product.price,
        transactionId: `order-${Date.now()}`,
        products: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }]
      });
      
      toast({
        title: "Pagamento enviado!",
        description: "Seu pagamento foi enviado para análise manual e você receberá o acesso via e-mail.",
        duration: 5000,
      });
      
      // Redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formattedPrice = product.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-lg mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Pagamento via PIX</h1>
          <p className="text-gray-600">
            Envie o valor de {formattedPrice} para a chave PIX abaixo.
            Após confirmar o pagamento, você receberá o acesso via e-mail.
          </p>
        </div>
        
        {/* Alert countdown (simulated) */}
        <div className="bg-pink-100 text-pink-800 p-3 rounded-md mb-8 text-center text-sm flex items-center justify-center">
          <Clock className="h-4 w-4 mr-2" />
          Faltam 15:52 para o pagamento expirar...
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* PIX QR Code section */}
            <Card className="shadow-sm mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">Pague com PIX</CardTitle>
                <p className="text-center text-sm text-gray-500">
                  Escaneie o QR Code ou use o código para fazer o pagamento
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="border-2 border-gray-200 p-2 rounded-md">
                    <img 
                      src="/lovable-uploads/db42b0b5-b7f2-4418-a818-b1dd1ef078cd.png" 
                      alt="QR Code PIX" 
                      className="w-40 h-40 mx-auto" 
                    />
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500">
                  Escaneie o QR Code com o app do seu banco para copiar o código PIX
                </div>
                
                {/* PIX Key */}
                <div className="mt-4">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <input
                      type="text"
                      value={pixData.pixKey}
                      readOnly
                      className="flex-1 p-2 text-gray-600 bg-gray-50 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-full px-3 hover:bg-gray-100"
                      onClick={handleCopyPixKey}
                    >
                      {isCopied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-2">{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Confirm Button */}
                <Button
                  onClick={handleConfirmPayment}
                  className="w-full bg-green-600 hover:bg-green-700 mt-4"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processando...</>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar pagamento
                    </>
                  )}
                </Button>
                
                <div className="text-center text-xs text-gray-500">
                  <span className="flex items-center justify-center text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Pagamento 100% seguro
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Receiver Info */}
            <Card className="shadow-sm bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dados do Recebedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm w-24">Nome:</span>
                  <span className="text-sm font-medium">Marcos Aurelio B Martins</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm w-24">E-mail:</span>
                  <span className="text-sm">email@example.com</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            {/* Order Summary */}
            <Card className="shadow-sm mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Produto:</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formattedPrice}</span>
                </div>
                
                <Separator />
                
                <div className="bg-pink-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-xl font-bold text-pink-700">{formattedPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Instructions */}
            <Card className="shadow-sm mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Para realizar o pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">
                    1
                  </div>
                  <p>Abra o aplicativo do seu banco.</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">
                    2
                  </div>
                  <p>Escolha a opção PIX e cole o código ou use a câmera do celular para escanear o QR Code.</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">
                    3
                  </div>
                  <p>Confirme as informações e finalize o pagamento.</p>
                </div>
              </CardContent>
            </Card>
            
            {/* FAQ */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm font-medium">
                      Como funciona o pagamento?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      O pagamento via PIX é instantâneo. Após fazer o pagamento, nosso sistema irá verificar e liberar seu acesso automaticamente em até 5 minutos.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm font-medium">
                      Quanto tempo leva para ter acesso?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      Geralmente o acesso é liberado em até 5 minutos após a confirmação do pagamento. Você receberá um e-mail com as instruções de acesso.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm font-medium">
                      Posso pedir reembolso?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      Sim, você tem até 7 dias após a compra para solicitar reembolso, conforme o Código de Defesa do Consumidor. Entre em contato conosco pelo e-mail de suporte.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixPaymentManual;
