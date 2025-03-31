
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AsaasSettings } from '@/types/asaas';

interface ApiKeysCardProps {
  formState: AsaasSettings;
  onUpdateFormState: (updater: (prev: AsaasSettings) => AsaasSettings) => void;
}

const ApiKeysCard: React.FC<ApiKeysCardProps> = ({
  formState,
  onUpdateFormState,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chaves de API do Asaas</CardTitle>
        <CardDescription>
          Configure as chaves de API para os ambientes de teste e produção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="sandboxApiKey">Chave da API Sandbox (Ambiente de Testes)</Label>
          <Input
            id="sandboxApiKey"
            value={formState.sandboxApiKey || ''}
            onChange={(e) => onUpdateFormState(prev => ({ ...prev, sandboxApiKey: e.target.value }))}
            placeholder="$aas_SANDBOX_..."
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Use esta chave para testes. Pagamentos não serão processados de verdade.
          </p>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-2">
          <Label htmlFor="productionApiKey">Chave da API Produção</Label>
          <Input
            id="productionApiKey"
            value={formState.productionApiKey || ''}
            onChange={(e) => onUpdateFormState(prev => ({ ...prev, productionApiKey: e.target.value }))}
            placeholder="$aas_PRODUCTION_..."
            className="font-mono"
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Use esta chave para pagamentos reais em ambiente de produção.
          </p>
        </div>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Suas chaves de API são dados sensíveis. Certifique-se de que está usando a chave correta para o ambiente selecionado.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ApiKeysCard;
