
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import VisitorStats from '@/components/dashboard/VisitorStats';
import PaymentStats from '@/components/dashboard/PaymentStats';
import VisitorsChart from '@/components/dashboard/VisitorsChart';
import PaymentMethodsChart from '@/components/dashboard/PaymentMethodsChart';
import { transactions } from '@/utils/mockData';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardHeader />
      
      <VisitorStats />
      
      <PaymentStats />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <VisitorsChart />
        <PaymentMethodsChart />
      </div>

      <RecentTransactions transactions={transactions} />
    </DashboardLayout>
  );
};

export default Dashboard;
