
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';

const Checkout = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');

  // Mock function to handle payment submission
  const handlePaymentSubmit = (data: any) => {
    // In the future, this would interact with payment gateways
    toast({
      title: "Dados de pagamento recebidos",
      description: `Os dados foram armazenados para processamento futuro.`,
      duration: 5000,
    });
    
    console.log('Payment data:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">Checkout</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Finalizar Compra</h2>
            <p className="text-gray-600">Produto: {slug}</p>
          </div>

          {/* Payment processing notice */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ambiente de Testes</AlertTitle>
            <AlertDescription>
              Esta é uma página de teste. Os pagamentos não serão processados.
            </AlertDescription>
          </Alert>

          {/* Payment methods tabs */}
          <Tabs 
            defaultValue="card" 
            className="w-full"
            onValueChange={(value) => setPaymentMethod(value as 'card' | 'pix')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="card" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Cartão de Crédito</span>
              </TabsTrigger>
              <TabsTrigger value="pix" className="flex items-center">
                <QrCode className="mr-2 h-4 w-4" />
                <span>PIX</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="card">
              <CheckoutForm onSubmit={handlePaymentSubmit} />
            </TabsContent>
            
            <TabsContent value="pix">
              <PixPayment onSubmit={handlePaymentSubmit} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MercadoPay. Todos direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
