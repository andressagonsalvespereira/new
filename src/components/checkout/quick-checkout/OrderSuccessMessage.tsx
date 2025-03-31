
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OrderSuccessMessageProps {
  paymentMethod: 'PIX' | 'CREDIT_CARD';
}

const OrderSuccessMessage: React.FC<OrderSuccessMessageProps> = ({ paymentMethod }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-4">
      <h3 className="font-semibold text-green-600 mb-2">
        Pedido Realizado com Sucesso!
      </h3>
      <p className="text-gray-600 mb-4">
        {paymentMethod === 'PIX' 
          ? 'Utilize o QR code PIX abaixo para finalizar seu pagamento.' 
          : 'Seu pagamento foi processado com sucesso. Você receberá um e-mail com os detalhes do pedido.'}
      </p>
      {paymentMethod === 'CREDIT_CARD' && (
        <Button
          onClick={() => navigate('/')}
          className="bg-green-600 hover:bg-green-700"
        >
          Voltar para a página inicial
        </Button>
      )}
    </div>
  );
};

export default OrderSuccessMessage;
