
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import StatCard from './StatCard';
import { getVisitorPeriods } from '@/utils/dashboardUtils';

const VisitorStats = () => {
  const visitorPeriods = getVisitorPeriods();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Visitantes Online Agora"
        value={`${Math.floor(Math.random() * 15) + 1}`}
        icon={<Users className="h-5 w-5 text-blue-500" />}
        className="border-blue-100"
      />
      <StatCard
        title="Visitantes - 24h"
        value={`${visitorPeriods['24h']}`}
        icon={<Users className="h-5 w-5 text-green-500" />}
        className="border-green-100"
      />
      <StatCard
        title="Visitantes - 72h"
        value={`${visitorPeriods['72h']}`}
        icon={<Users className="h-5 w-5 text-purple-500" />}
        className="border-purple-100"
      />
    </div>
  );
};

export default VisitorStats;
