
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsaas } from '@/contexts/AsaasContext';
import { useProducts } from '@/contexts/ProductContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, CreditCard, Loader2, Package, QrCode } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PixPayment from '@/components/checkout/PixPayment';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import asaasService from '@/services/asaasService';
import { trackPurchase, trackAddToCart } from '@/services/pixelService';

const QuickCheckout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProduct } = useProducts();
  const { settings, loading: loadingSettings } = useAsaas();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  
  // Customer form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Initialize checkout
  useEffect(() => {
    if (productId) {
      const productData = getProduct(productId);
      if (productData) {
        setProduct(productData);
        
        // Track Add to Cart event
        trackAddToCart({
          value: productData.price,
          productId: productData.id,
          productName: productData.name
        });
      } else {
        setError('Product not found');
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  }, [productId, getProduct, toast]);
  
  // Set default payment method based on available options
  useEffect(() => {
    if (!loadingSettings && settings.isEnabled) {
      if (!settings.allowPix && settings.allowCreditCard) {
        setPaymentMethod('card');
      } else if (settings.allowPix && !settings.allowCreditCard) {
        setPaymentMethod('pix');
      }
    }
  }, [loadingSettings, settings]);
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!cpf.trim()) {
      errors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(cpf.replace(/[^\d]/g, ''))) {
      errors.cpf = 'CPF inválido';
    }
    
    if (!phone.trim()) {
      errors.phone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(phone.replace(/[^\d]/g, ''))) {
      errors.phone = 'Telefone inválido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handlePayment = async () => {
    if (!validateForm()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create customer
      const customerData = {
        name: fullName,
        email: email,
        cpfCnpj: cpf.replace(/[^\d]/g, ''),
        phone: phone.replace(/[^\d]/g, ''),
      };
      
      // In a real implementation, this would make API calls
      // const customer = await asaasService.createCustomer(customerData, settings.isSandbox);
      
      // Create payment based on payment method
      /*
      const paymentData = {
        customer: customer.id,
        billingType: paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
        value: product.price,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Compra de ${product.name}`,
      };
      
      const payment = await asaasService.createPayment(paymentData, settings.isSandbox);
      */
      
      // This is just a mock for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track purchase event
      if (product) {
        trackPurchase({
          value: product.price,
          transactionId: `quick-order-${Date.now()}`,
          products: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
          }]
        });
      }
      
      toast({
        title: "Pagamento iniciado",
        description: "Sua solicitação de pagamento foi iniciada com sucesso!",
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      setLoading(false);
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  if (loading || loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-lg mx-auto shadow-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
            <p>Carregando checkout...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-lg mx-auto shadow-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-medium mb-2">Produto não encontrado</p>
            <p className="mb-6">O produto solicitado não está disponível.</p>
            <Button onClick={() => navigate('/')}>Voltar para a página inicial</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <Card className="w-full max-w-lg mx-auto shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Checkout Rápido</CardTitle>
          <CardDescription>Complete seu pedido em poucos passos</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Product Information */}
          <div className="flex items-center p-4 border rounded-lg bg-gray-50">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-16 h-16 rounded object-cover mr-4" 
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center mr-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-gray-500 text-sm">{product.description || ''}</p>
              <p className="font-bold text-lg mt-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(product.price)}
              </p>
            </div>
          </div>
          
          {/* Customer Information Form */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Seus dados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome completo*</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={formErrors.fullName ? 'border-red-500' : 'border-gray-300'}
                />
                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
              </div>
              
              <div>
                <Label htmlFor="email">E-mail*</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={formErrors.email ? 'border-red-500' : 'border-gray-300'}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF*</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className={formErrors.cpf ? 'border-red-500' : 'border-gray-300'}
                  placeholder="000.000.000-00"
                />
                {formErrors.cpf && <p className="text-red-500 text-xs mt-1">{formErrors.cpf}</p>}
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone*</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={formErrors.phone ? 'border-red-500' : 'border-gray-300'}
                  placeholder="(00) 00000-0000"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
            </div>
          </div>
          
          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Pagamento</h3>
            
            {!settings.isEnabled ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pagamentos estão temporariamente indisponíveis.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Payment Method Selection (only show if both are enabled) */}
                {settings.allowPix && settings.allowCreditCard && (
                  <RadioGroup
                    defaultValue={paymentMethod}
                    className="flex flex-row space-x-3 mb-4"
                    onValueChange={(value) => setPaymentMethod(value as 'card' | 'pix')}
                  >
                    <div className="flex-1 flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center cursor-pointer">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                        <span>Cartão de Crédito</span>
                      </Label>
                    </div>
                    
                    <div className="flex-1 flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center cursor-pointer">
                        <QrCode className="h-5 w-5 mr-2 text-green-600" />
                        <span>PIX</span>
                      </Label>
                    </div>
                  </RadioGroup>
                )}
                
                {/* Payment Components */}
                {settings.allowCreditCard && paymentMethod === 'card' && (
                  <CheckoutForm 
                    onSubmit={handlePayment}
                    isSandbox={settings.isSandbox}
                  />
                )}
                
                {settings.allowPix && paymentMethod === 'pix' && (
                  <PixPayment
                    onSubmit={handlePayment}
                    isSandbox={settings.isSandbox}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickCheckout;
