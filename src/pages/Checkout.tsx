import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CreditCard, QrCode, AlertCircle, CheckCircle2, Truck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';
import CustomerInfoForm, { CustomerData } from '@/components/checkout/CustomerInfoForm';
import AddressForm, { AddressData } from '@/components/checkout/AddressForm';

const Checkout = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerData | null>(null);
  const [addressInfo, setAddressInfo] = useState<AddressData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getProductDetails = () => {
    const products = {
      'assinatura-mensal-cineflick-card': {
        name: 'Assinatura Mensal CineFlick',
        price: 19.90,
        description: 'Acesso ilimitado a filmes e séries por 1 mês',
        interval: 'Mensal'
      },
      'product-demo': {
        name: 'Produto Demo',
        price: 120.00,
        description: 'Este é um produto de demonstração',
        interval: 'Único'
      }
    };

    return products[slug as keyof typeof products] || {
      name: slug,
      price: 120.00,
      description: 'Produto não encontrado',
      interval: 'Único'
    };
  };

  const productDetails = getProductDetails();

  const handleCustomerInfoChange = (data: CustomerData) => {
    setCustomerInfo(data);
  };

  const handleAddressInfoChange = (data: AddressData) => {
    setAddressInfo(data);
  };

  const handleCompleteCheckout = () => {
    if (!customerInfo) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha suas informações pessoais",
        duration: 3000,
      });
      return;
    }

    if (!addressInfo) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha seu endereço",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    
    const completeData = {
      customer: customerInfo,
      address: addressInfo,
      paymentMethod: paymentMethod,
      product: productDetails
    };
    
    toast({
      title: "Pagamento recebido",
      description: `Seu pagamento está sendo processado.`,
      duration: 5000,
    });
    
    console.log('Complete payment data:', completeData);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="bg-white shadow-sm py-4 px-4 md:px-6 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">CineFlick</h1>
          <div className="text-sm text-gray-500">Pagamento Seguro</div>
        </div>
      </header>

      <main className="flex-grow py-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {isSuccess ? (
            <Card className="border-green-200 shadow-md">
              <CardHeader className="bg-green-50 border-b border-green-100">
                <CardTitle className="text-xl text-green-700 flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Pagamento Confirmado
                </CardTitle>
                <CardDescription className="text-green-600">
                  Seu pagamento foi processado com sucesso
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-4 text-center">
                <div className="rounded-full bg-green-100 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Obrigado pela sua compra!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Você receberá um email de confirmação em breve com os detalhes da sua compra.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 max-w-md mx-auto">
                  <h4 className="font-medium text-lg mb-2">Resumo do pedido</h4>
                  <div className="flex justify-between mb-2">
                    <span>Cliente:</span>
                    <span>{customerInfo?.fullName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Email:</span>
                    <span>{customerInfo?.email}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Produto:</span>
                    <span>{productDetails.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Preço:</span>
                    <span className="font-bold">R$ {productDetails.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequência:</span>
                    <span>{productDetails.interval}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-0 pb-6">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Voltar para início
                </button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-8">
                  <div className="bg-black text-white p-3 mb-4 flex items-center">
                    <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-red-600 text-white mr-2">1</span>
                    <h2 className="font-medium text-lg">Informações Pessoais</h2>
                  </div>
                  <CustomerInfoForm 
                    onSubmit={handleCustomerInfoChange} 
                    isCompleted={false} 
                  />
                </div>
                
                <div className="mb-8">
                  <div className="bg-black text-white p-3 mb-4 flex items-center">
                    <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-red-600 text-white mr-2">2</span>
                    <h2 className="font-medium text-lg">Endereço de Entrega</h2>
                  </div>
                  <AddressForm
                    onSubmit={handleAddressInfoChange}
                    isCompleted={false}
                  />
                </div>
                
                <div>
                  <div className="bg-black text-white p-3 mb-4 flex items-center">
                    <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-red-600 text-white mr-2">3</span>
                    <h2 className="font-medium text-lg">Forma de Pagamento</h2>
                  </div>
                  
                  <div className="mb-6">
                    <RadioGroup
                      defaultValue="card"
                      className="flex flex-col space-y-3 mb-4"
                      onValueChange={(value) => setPaymentMethod(value as 'card' | 'pix')}
                    >
                      <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center cursor-pointer">
                          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                          <span>Cartão de Crédito</span>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex items-center cursor-pointer">
                          <QrCode className="h-5 w-5 mr-2 text-green-600" />
                          <span>PIX</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  
                    {paymentMethod === 'card' && (
                      <CheckoutForm onSubmit={() => {}} />
                    )}
                    
                    {paymentMethod === 'pix' && (
                      <PixPayment onSubmit={() => {}} />
                    )}
                  </div>

                  <div className="mt-8">
                    <Button 
                      onClick={handleCompleteCheckout} 
                      className="w-full py-6 text-lg" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processando pagamento...' : `Pagar R$ ${productDetails.price.toFixed(2)}`}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <Card className="bg-gray-50 border-gray-200 sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Resumo da compra</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{productDetails.name}</span>
                        <span>R$ {productDetails.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequência</span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {productDetails.interval}
                        </span>
                      </div>
                      
                      {addressInfo?.shippingOption && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frete</span>
                          <span className="text-green-600 font-medium">Grátis</span>
                        </div>
                      )}
                      
                      {addressInfo && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Endereço de entrega:</h4>
                          <p className="text-xs text-gray-600">
                            {`${addressInfo.street}, ${addressInfo.number}`}
                            {addressInfo.complement && `, ${addressInfo.complement}`}<br/>
                            {`${addressInfo.neighborhood}, ${addressInfo.city} - ${addressInfo.state}`}<br/>
                            {`CEP: ${addressInfo.cep}`}
                          </p>
                          
                          {addressInfo.shippingOption && (
                            <div className="mt-2 text-xs flex items-center text-green-700">
                              <Truck className="h-3 w-3 mr-1" />
                              <span>Entrega em 5-10 dias úteis</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-xl">R$ {productDetails.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 px-4 md:px-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:justify-between items-center text-sm text-gray-500">
          <div className="mb-3 md:mb-0">
            &copy; {new Date().getFullYear()} CineFlick. Todos direitos reservados.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-gray-700">Termos</a>
            <a href="#" className="hover:text-gray-700">Privacidade</a>
            <a href="#" className="hover:text-gray-700">Ajuda</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
