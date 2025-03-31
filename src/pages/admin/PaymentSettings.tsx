
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, QrCode, Settings, Save, AlertCircle, CreditCardIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAsaas } from '@/contexts/AsaasContext';

const PaymentSettings = () => {
  const { settings, loading, saveSettings } = useAsaas();
  const [formState, setFormState] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await saveSettings(formState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">Configure the Asaas payment integration</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Asaas Integration
              </CardTitle>
              <CardDescription>
                Configure your Asaas payment gateway integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Asaas Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on to enable payment processing through Asaas
                  </p>
                </div>
                <Switch
                  checked={formState.isEnabled}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, isEnabled: checked }))}
                  disabled={loading}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sandbox Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use Asaas sandbox for testing (does not process real payments)
                  </p>
                </div>
                <Switch
                  checked={formState.isSandbox}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, isSandbox: checked }))}
                  disabled={loading || !formState.isEnabled}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure which payment methods are available in your checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="pix"
                  checked={formState.allowPix}
                  onCheckedChange={(checked) => 
                    setFormState(prev => ({ ...prev, allowPix: !!checked }))
                  }
                  disabled={loading || !formState.isEnabled}
                />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="pix"
                    className="text-base font-medium leading-none flex items-center"
                  >
                    <QrCode className="mr-2 h-4 w-4 text-green-600" />
                    PIX Payments
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay using PIX instant payments
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="credit-card"
                  checked={formState.allowCreditCard}
                  onCheckedChange={(checked) => 
                    setFormState(prev => ({ ...prev, allowCreditCard: !!checked }))
                  }
                  disabled={loading || !formState.isEnabled}
                />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="credit-card"
                    className="text-base font-medium leading-none flex items-center"
                  >
                    <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                    Credit Card Payments
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay using credit cards
                  </p>
                </div>
              </div>
              
              {/* Manual Card Processing Option */}
              {formState.allowCreditCard && (
                <div className="mt-4 pl-8 border-l-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Manual Card Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable manual review of credit card payments instead of automatic processing
                      </p>
                    </div>
                    <Switch
                      checked={formState.manualCardProcessing}
                      onCheckedChange={(checked) => 
                        setFormState(prev => ({ ...prev, manualCardProcessing: checked }))
                      }
                      disabled={loading || !formState.isEnabled || !formState.allowCreditCard}
                    />
                  </div>
                  
                  {formState.manualCardProcessing && (
                    <Alert className="mt-2 bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        With manual processing enabled, card payments will not be processed automatically. 
                        Instead, customers will be redirected to a manual review page.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              
              {(!formState.allowPix && !formState.allowCreditCard && formState.isEnabled) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    At least one payment method must be enabled for checkout to work.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={loading || isSaving || (!formState.allowPix && !formState.allowCreditCard && formState.isEnabled)}
              >
                {isSaving ? (
                  <>Saving Settings...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Make sure you have configured your Asaas API keys in the environment variables before 
              enabling the integration in production mode.
            </AlertDescription>
          </Alert>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default PaymentSettings;
