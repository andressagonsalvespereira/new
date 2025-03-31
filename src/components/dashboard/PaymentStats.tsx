
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode, DollarSign } from 'lucide-react';
import StatCard from './StatCard';
import { getPaymentSummary, formatCurrency } from '@/utils/dashboardUtils';

const PaymentStats = () => {
  const paymentSummary = getPaymentSummary();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Cartões Capturados"
        value={`${paymentSummary.cardCaptured}`}
        icon={<CreditCard className="h-5 w-5 text-indigo-500" />}
        className="border-indigo-100"
      />
      <StatCard
        title="PIX Gerados"
        value={`${paymentSummary.pixGenerated}`}
        icon={<QrCode className="h-5 w-5 text-green-500" />}
        className="border-green-100"
      />
      <StatCard
        title="PIX Concluídos"
        value={`${paymentSummary.pixCompleted}`}
        icon={<QrCode className="h-5 w-5 text-emerald-500" />}
        className="border-emerald-100"
      />
      <StatCard
        title="Valor Total"
        value={formatCurrency(paymentSummary.totalValue)}
        icon={<DollarSign className="h-5 w-5 text-amber-500" />}
        className="border-amber-100"
      />
    </div>
  );
};

export default PaymentStats;
