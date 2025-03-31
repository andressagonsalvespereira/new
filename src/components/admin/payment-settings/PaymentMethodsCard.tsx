
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, QrCode, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { AsaasSettings } from '@/types/asaas';

interface PaymentMethodsCardProps {
  formState: AsaasSettings;
  loading: boolean;
  onUpdateFormState: (updater: (prev: AsaasSettings) => AsaasSettings) => void;
}

const PaymentMethodsCard: React.FC<PaymentMethodsCardProps> = ({
  formState,
  loading,
  onUpdateFormState,
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>
          Configure quais métodos de pagamento estão disponíveis no seu checkout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="pix"
            checked={formState.allowPix}
            onCheckedChange={(checked) => 
              onUpdateFormState(prev => ({ ...prev, allowPix: !!checked }))
            }
            disabled={loading || !formState.isEnabled}
          />
          <div className="grid gap-1.5">
            <Label
              htmlFor="pix"
              className="text-base font-medium leading-none flex items-center"
            >
              <QrCode className="mr-2 h-4 w-4 text-green-600" />
              Pagamentos via PIX
            </Label>
            <p className="text-sm text-muted-foreground">
              Permitir que os clientes paguem usando PIX
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="credit-card"
            checked={formState.allowCreditCard}
            onCheckedChange={(checked) => 
              onUpdateFormState(prev => ({ ...prev, allowCreditCard: !!checked }))
            }
            disabled={loading || !formState.isEnabled}
          />
          <div className="grid gap-1.5">
            <Label
              htmlFor="credit-card"
              className="text-base font-medium leading-none flex items-center"
            >
              <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
              Pagamentos via Cartão de Crédito
            </Label>
            <p className="text-sm text-muted-foreground">
              Permitir que os clientes paguem usando cartões de crédito
            </p>
          </div>
        </div>
        
        {/* Manual Card Processing Option */}
        {formState.allowCreditCard && (
          <div className="mt-4 pl-8 border-l-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Processamento Manual de Cartão</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar revisão manual de pagamentos com cartão de crédito em vez de processamento automático
                </p>
              </div>
              <Switch
                checked={formState.manualCardProcessing}
                onCheckedChange={(checked) => 
                  onUpdateFormState(prev => ({ ...prev, manualCardProcessing: checked }))
                }
                disabled={loading || !formState.isEnabled || !formState.allowCreditCard}
              />
            </div>
            
            {formState.manualCardProcessing && (
              <Alert className="mt-2 bg-amber-50 border-amber-200">
                <AlertCircleIcon className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Com o processamento manual ativado, os pagamentos com cartão não serão processados automaticamente. 
                  Em vez disso, os clientes serão redirecionados para uma página de revisão manual.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {(!formState.allowPix && !formState.allowCreditCard && formState.isEnabled) && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Aviso</AlertTitle>
            <AlertDescription>
              Pelo menos um método de pagamento deve estar habilitado para que o checkout funcione.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsCard;
