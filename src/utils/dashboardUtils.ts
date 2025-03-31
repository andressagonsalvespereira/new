
// Data utility functions for dashboard displays
import { subDays, format } from 'date-fns';

// Generate dates for the last n days
export const generateDateLabels = (days: number): string[] => {
  return Array.from({ length: days }).map((_, i) => {
    return format(subDays(new Date(), days - 1 - i), 'dd/MM');
  });
};

// Generate random data for visitors
export const generateVisitorData = (days: number): number[] => {
  return Array.from({ length: days }).map(() => Math.floor(Math.random() * 100) + 20);
};

// Format payment values for display
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Get visitor time periods
export const getVisitorPeriods = () => {
  return {
    '24h': generateVisitorData(24).reduce((a, b) => a + b, 0),
    '48h': generateVisitorData(48).reduce((a, b) => a + b, 0),
    '72h': generateVisitorData(72).reduce((a, b) => a + b, 0),
  };
};

// Get payment method summaries
export const getPaymentSummary = () => {
  return {
    cardCaptured: Math.floor(Math.random() * 50) + 10,
    pixGenerated: Math.floor(Math.random() * 30) + 5,
    pixCompleted: Math.floor(Math.random() * 20) + 3,
    totalValue: Math.floor(Math.random() * 10000) + 1000,
  };
};
