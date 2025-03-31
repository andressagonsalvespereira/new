import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutFooter from '@/components/checkout/CheckoutFooter';
import PersonalInfoSection from '@/components/checkout/PersonalInfoSection';
import AddressSection from '@/components/checkout/AddressSection';
import PaymentMethodSection from '@/components/checkout/PaymentMethodSection';
import OrderSummarySection from '@/components/checkout/OrderSummarySection';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';

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
    return <CheckoutSuccess productDetails={productDetails} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <main className="max-w-xl mx-auto py-6 px-4">
        <PersonalInfoSection 
          fullName={fullName} 
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          cpf={cpf}
          setCpf={(value) => setCpf(formatCPF(value))}
          phone={phone}
          setPhone={(value) => setPhone(formatPhone(value))}
          formErrors={formErrors}
        />
        
        <AddressSection 
          cep={cep}
          handleCepChange={handleCepChange}
          street={street}
          setStreet={setStreet}
          number={number}
          setNumber={setNumber}
          complement={complement}
          setComplement={setComplement}
          neighborhood={neighborhood}
          setNeighborhood={setNeighborhood}
          city={city}
          setCity={setCity}
          state={state}
          setState={setState}
          formErrors={formErrors}
        />
        
        <PaymentMethodSection 
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
        
        <OrderSummarySection 
          productDetails={productDetails}
          handlePayment={handlePayment}
          isProcessing={isProcessing}
        />
      </main>
      
      <CheckoutFooter />
    </div>
  );
};

export default Checkout;
