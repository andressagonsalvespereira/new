
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PaymentForm from '@/components/payments/PaymentForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, QrCode, ExternalLink, Settings, ShoppingCart } from 'lucide-react';
import { useAsaas } from '@/contexts/AsaasContext';

const Payments = () => {
  const { settings, loading } = useAsaas();

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Process Payment</h1>
          <p className="text-muted-foreground">Create a new payment transaction</p>
        </div>
        
        <div className="flex space-x-2">
          <Link to="/admin/orders">
            <Button variant="outline" className="flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Orders
            </Button>
          </Link>
          <Link to="/admin/settings/payment">
            <Button variant="outline" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Payment Settings
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mb-6 space-y-2">
        <Link to="/checkout/assinatura-mensal-cineflick-card">
          <Button className="flex items-center">
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar Página de Checkout (CineFlick)
          </Button>
        </Link>
        <Link to="/checkout/product-demo">
          <Button variant="outline" className="flex items-center">
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar Página de Checkout (Demo)
          </Button>
        </Link>
      </div>
      
      {!loading && settings.isEnabled ? (
        <Tabs defaultValue="card">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            {settings.allowCreditCard && (
              <TabsTrigger value="card" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Credit Card</span>
              </TabsTrigger>
            )}
            {settings.allowPix && (
              <TabsTrigger value="pix" className="flex items-center">
                <QrCode className="mr-2 h-4 w-4" />
                <span>PIX</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          {settings.allowCreditCard && (
            <TabsContent value="card">
              <PaymentForm />
            </TabsContent>
          )}
          
          {settings.allowPix && (
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
          )}
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Processing</CardTitle>
            <CardDescription>
              Payment processing is currently disabled. Enable it in settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link to="/admin/settings/payment">
              <Button className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Configure Payment Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Payments;
