
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, QrCode, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PixPayment from '@/components/checkout/PixPayment';

const Checkout = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const productDetails = {
    name: "Caneleira Gold",
    price: 59.90,
    description: 'Proteção premium para suas pernas',
    image: '/lovable-uploads/1664640d-4609-448d-9936-1d17bb6ed55a.png'
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2').substring(0, 9);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    setCep(formattedCep);
    
    if (formattedCep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formattedCep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          
          // Clear previous errors for these fields
          const newErrors = {...formErrors};
          delete newErrors.street;
          delete newErrors.neighborhood;
          delete newErrors.city;
          delete newErrors.state;
          setFormErrors(newErrors);
        } else {
          setFormErrors(prev => ({...prev, cep: 'CEP não encontrado'}));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setFormErrors(prev => ({...prev, cep: 'Erro ao buscar CEP'}));
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!fullName) errors.fullName = 'Nome é obrigatório';
    if (!email) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email inválido';
    if (!cpf) errors.cpf = 'CPF é obrigatório';
    if (!phone) errors.phone = 'Telefone é obrigatório';
    if (!cep) errors.cep = 'CEP é obrigatório';
    if (!street) errors.street = 'Rua é obrigatória';
    if (!number) errors.number = 'Número é obrigatório';
    if (!neighborhood) errors.neighborhood = 'Bairro é obrigatório';
    if (!city) errors.city = 'Cidade é obrigatória';
    if (!state) errors.state = 'Estado é obrigatório';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = () => {
    if (!validateForm()) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast({
        title: "Pagamento recebido",
        description: `Seu pagamento foi processado com sucesso.`,
        duration: 5000,
      });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-green-200">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="rounded-full bg-green-100 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Obrigado pela sua compra!</h3>
              <p className="text-gray-600 mb-6">
                Você receberá um email de confirmação em breve com os detalhes da sua compra.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-lg mb-2">Resumo do pedido</h4>
                <div className="flex justify-between mb-2">
                  <span>Produto:</span>
                  <span>{productDetails.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Total:</span>
                  <span className="font-bold">R$ {productDetails.price.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Voltar para a loja
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white py-2 px-4 flex justify-center items-center">
        <div className="text-sm">Oferta disponível por tempo limitado: <span className="font-bold">00:14:46</span></div>
      </header>
      
      <div className="bg-red-700 text-white py-2 px-4 flex justify-between items-center">
        <div className="text-sm">+ DE 50.000</div>
        <div className="text-sm font-bold">CONTEÚDOS</div>
      </div>
      
      <div className="bg-red-700 py-3">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between bg-black rounded-md p-2 text-white">
            <p className="text-xs">Oferta por tempo limitado! Garanta o seu acesso:</p>
            <div className="flex items-center space-x-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>Termina em 00:14:45</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-2 px-4 bg-gray-100 text-center text-sm">
        <div className="max-w-xl mx-auto bg-white border rounded-md shadow-sm p-3 flex items-center justify-center">
          <span className="font-bold">PREENCHA SEUS DADOS ABAIXO</span>
        </div>
      </div>

      <main className="max-w-xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</div>
            <h2 className="font-medium">Identificação</h2>
          </div>
          
          <div className="space-y-4 px-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fullName" className="block text-sm mb-1">Nome completo</label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`h-9 ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Digite seu nome"
                />
                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-1">E-mail</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-9 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Digite seu e-mail"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cpf" className="block text-sm mb-1">CPF/CNPJ</label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  className={`h-9 ${formErrors.cpf ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Digite seu CPF"
                />
                {formErrors.cpf && <p className="text-red-500 text-xs mt-1">{formErrors.cpf}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm mb-1">Celular</label>
                <div className="flex">
                  <Select defaultValue="55">
                    <SelectTrigger className="w-20 h-9 border-gray-300">
                      <SelectValue placeholder="+55" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="55">+55</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className={`h-9 ml-2 flex-1 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</div>
            <h2 className="font-medium">Endereço</h2>
            <div className="ml-auto text-xs text-gray-500">3 informações</div>
          </div>
          
          <div className="space-y-4 px-2">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor="cep" className="block text-sm mb-1">CEP</label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={handleCepChange}
                  className={`h-9 ${formErrors.cep ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="00000-000"
                />
                {formErrors.cep && <p className="text-red-500 text-xs mt-1">{formErrors.cep}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="street" className="block text-sm mb-1">Endereço</label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`h-9 ${formErrors.street ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Rua, Avenida, etc."
                />
                {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
              </div>
              <div>
                <label htmlFor="number" className="block text-sm mb-1">Número</label>
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className={`h-9 ${formErrors.number ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="123"
                />
                {formErrors.number && <p className="text-red-500 text-xs mt-1">{formErrors.number}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label htmlFor="complement" className="block text-sm mb-1">Complemento (opcional)</label>
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  className="h-9 border-gray-300"
                  placeholder="Apto, Bloco, Casa, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="neighborhood" className="block text-sm mb-1">Bairro</label>
                <Input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className={`h-9 ${formErrors.neighborhood ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Seu bairro"
                />
                {formErrors.neighborhood && <p className="text-red-500 text-xs mt-1">{formErrors.neighborhood}</p>}
              </div>
              <div>
                <label htmlFor="city" className="block text-sm mb-1">Cidade</label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`h-9 ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Sua cidade"
                />
                {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
              </div>
              <div>
                <label htmlFor="state" className="block text-sm mb-1">Estado</label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`h-9 ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="UF"
                />
                {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
              </div>
            </div>
          </div>
          
          <div className="mt-6 px-2">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="User" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <p className="font-medium text-sm">Fernanda dos Santos</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm mb-4">
              Ótima loja, entreguei o produto rápido e correto, realmente entregou o que prometeu
            </p>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="User" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">Carlos Nascimento</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-4">
                Excelente produto! Os tênis vieram perfeitos, bem embalados. Amei!
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</div>
            <h2 className="font-medium">Pagamento</h2>
            <div className="ml-auto text-xs text-gray-500">Cartão ou Pix</div>
          </div>
          
          <div className="px-2">
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
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">4</div>
            <h2 className="font-medium">Sua Compra</h2>
            <div className="ml-auto text-sm font-medium">Total: <span className="text-red-600">R$ 59,90</span></div>
          </div>
          
          <div className="px-2">
            <div className="border rounded-md p-4 mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-100 rounded mr-4 overflow-hidden">
                  <img src={productDetails.image} alt={productDetails.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{productDetails.name}</h3>
                  <p className="text-sm text-gray-600">{productDetails.description}</p>
                  <p className="text-red-600 font-bold">R$ {productDetails.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handlePayment} 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-md"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Finalizar agora'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Pagamentos 100% seguros, todos os cartões aceitos</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-3 px-4 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
        <p>Powered by <span className="text-green-600">CheckoutSeguro</span></p>
      </footer>
    </div>
  );
};

export default Checkout;
