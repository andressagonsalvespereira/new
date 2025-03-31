
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalInfoSectionProps {
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  cpf: string;
  setCpf: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  formErrors: Record<string, string>;
}

const PersonalInfoSection = ({ 
  fullName, setFullName, 
  email, setEmail, 
  cpf, setCpf, 
  phone, setPhone, 
  formErrors 
}: PersonalInfoSectionProps) => {
  return (
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
              onChange={(e) => setCpf(e.target.value)}
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
                onChange={(e) => setPhone(e.target.value)}
                className={`h-9 ml-2 flex-1 ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="(00) 00000-0000"
              />
            </div>
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
