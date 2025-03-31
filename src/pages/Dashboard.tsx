
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { transactions } from '@/utils/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '01/06', value: 420 },
  { name: '02/06', value: 380 },
  { name: '03/06', value: 550 },
  { name: '04/06', value: 590 },
  { name: '05/06', value: 620 },
  { name: '06/06', value: 400 },
  { name: '07/06', value: 450 },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardHeader />
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0EA5E9" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentTransactions transactions={transactions} />
    </DashboardLayout>
  );
};

export default Dashboard;
