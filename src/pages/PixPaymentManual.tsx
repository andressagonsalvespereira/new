
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CheckoutContainer from '@/components/checkout/CheckoutContainer';
import { useOrders } from '@/contexts/OrderContext';
import { usePixel } from '@/contexts/PixelContext';

const PixPaymentManual = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOrderStatus } = useOrders();
  const { trackPurchase } = usePixel();
  
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Extract data from location state
  const { state } = location;
  const orderData = state?.orderData;
  const pixData = state?.pixData;
  
  if (!orderData || !pixData) {
    // Redirect back to home if no data is available
    navigate('/');
    return null;
  }
  
  const handleCopyPixCode = () => {
    if (pixData.pixCopiaECola) {
      navigator.clipboard.writeText(pixData.pixCopiaECola)
        .then(() => {
          toast({
            title: "Código PIX copiado!",
            description: "Cole no seu aplicativo de banco para fazer o pagamento.",
            duration: 3000,
          });
        })
        .catch(err => {
          console.error('Erro ao copiar código PIX:', err);
          toast({
            title: "Erro ao copiar",
            description: "Não foi possível copiar o código automaticamente. Tente copiar manualmente.",
            variant: "destructive",
            duration: 3000,
          });
        });
    }
  };
  
  const handleConfirmPayment = async () => {
    if (!confirmationCode.trim()) {
      toast({
        title: "Código de confirmação necessário",
        description: "Por favor, insira o código de confirmação do PIX.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to validate confirmation code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update order status
      const orderId = pixData.orderId || 'unknown';
      await updateOrderStatus(orderId, 'Pago');
      
      // Track purchase
      trackPurchase({
        value: orderData.productPrice,
        transactionId: `order-${orderId}`,
        products: [{
          id: orderData.productId || 'unknown',
          name: orderData.productName,
          price: orderData.productPrice,
          quantity: 1
        }]
      });
      
      setIsConfirmed(true);
      
      toast({
        title: "Pagamento confirmado!",
        description: "Recebemos a confirmação do seu pagamento via PIX.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro na confirmação",
        description: "Não foi possível confirmar seu pagamento. Tente novamente ou contate o suporte.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isConfirmed) {
    return (
      <CheckoutContainer>
        <Card className="border-green-200 bg-green-50 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Pagamento Confirmado
            </h2>
            
            <p className="text-green-600 mb-6">
              Seu pagamento via PIX foi confirmado com sucesso!
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700"
              >
                Voltar para a página inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </CheckoutContainer>
    );
  }
  
  return (
    <CheckoutContainer>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">Pagamento via PIX</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center mb-4">
            <div className="font-semibold">{orderData.productName}</div>
            <div className="text-xl font-bold text-green-600">R$ {orderData.productPrice.toFixed(2)}</div>
          </div>
          
          {/* QR Code Display */}
          <div className="flex flex-col items-center py-4">
            {pixData.qrCodeImage ? (
              <img 
                src={pixData.qrCodeImage} 
                alt="QR Code PIX" 
                className="w-48 h-48 mb-4 border p-2 rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-4 rounded-lg">
                <span className="text-gray-500">QR Code não disponível</span>
              </div>
            )}
            
            <div className="text-sm text-gray-600 text-center mb-2">
              Escaneie o QR Code acima com o aplicativo do seu banco
            </div>
          </div>
          
          {/* Copy and Paste PIX Code */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-medium">PIX Copia e Cola</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyPixCode}
                className="h-8 px-2"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="bg-white border rounded p-2 text-sm text-gray-600 break-all">
              {pixData.pixCopiaECola || 'Código PIX não disponível'}
            </div>
          </div>
          
          {/* Payment Confirmation Section */}
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-3">Confirmar Pagamento</h3>
            <p className="text-sm text-gray-600 mb-4">
              Após realizar o pagamento via PIX, insira o código de confirmação recebido:
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmationCode">Código de confirmação:</Label>
                <Input
                  id="confirmationCode"
                  placeholder="Ex: PIX123456"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                onClick={handleConfirmPayment}
                disabled={isSubmitting || !confirmationCode.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Pagamento'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="text-sm"
          >
            Voltar para a página inicial
          </Button>
        </CardFooter>
      </Card>
    </CheckoutContainer>
  );
};

export default PixPaymentManual;
