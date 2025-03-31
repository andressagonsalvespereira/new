
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PaymentForm from '@/components/payments/PaymentForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode } from 'lucide-react';

const Payments = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Process Payment</h1>
        <p className="text-muted-foreground">Create a new payment transaction</p>
      </div>
      
      <Tabs defaultValue="card">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="card" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Credit Card</span>
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex items-center">
            <QrCode className="mr-2 h-4 w-4" />
            <span>PIX</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="card">
          <PaymentForm />
        </TabsContent>
        
        <TabsContent value="pix">
          <Card>
            <CardHeader>
              <CardTitle>PIX Payment</CardTitle>
              <CardDescription>
                Generate a PIX QR code for instant payment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-4">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-center text-sm text-gray-500 mb-4">
                Scan this QR code with your banking app to make an instant payment
              </p>
              <Button variant="outline" className="mb-2">
                Copy PIX Key
              </Button>
              <Button>
                Generate New Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Payments;
