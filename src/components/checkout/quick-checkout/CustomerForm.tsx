
import React from 'react';
import { Button } from '@/components/ui/button';
import { CustomerInfo } from '@/types/order';

interface CustomerFormProps {
  customerDetails: CustomerInfo;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  onSubmit: (data: CustomerInfo) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customerDetails, 
  setCustomerDetails, 
  onSubmit 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Informações do Cliente</h3>
      <div className="space-y-3">
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Nome completo"
          value={customerDetails.name}
          onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
        />
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="E-mail"
          type="email"
          value={customerDetails.email}
          onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
        />
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="CPF"
          value={customerDetails.cpf}
          onChange={(e) => setCustomerDetails({...customerDetails, cpf: e.target.value})}
        />
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Telefone"
          value={customerDetails.phone}
          onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
        />
        <Button 
          onClick={() => onSubmit(customerDetails)}
          disabled={!customerDetails.name || !customerDetails.email || !customerDetails.cpf}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Continuar para Pagamento
        </Button>
      </div>
    </div>
  );
};

export default CustomerForm;
