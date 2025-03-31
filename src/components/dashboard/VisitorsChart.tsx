
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateDateLabels, generateVisitorData } from '@/utils/dashboardUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const VisitorsChart = () => {
  const days = 7;
  const dates = generateDateLabels(days);
  const visitors = generateVisitorData(days);
  
  const data = dates.map((date, index) => ({
    name: date,
    visitors: visitors[index],
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Visitantes dos Últimos 7 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                name="Visitantes"
                stroke="#6366F1" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorsChart;
