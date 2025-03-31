
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, QrCode, Settings, Save, AlertCircle, CreditCardIcon, Key } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAsaas } from '@/contexts/AsaasContext';
import { useToast } from '@/hooks/use-toast';

const PaymentSettings = () => {
  const { settings, loading, saveSettings } = useAsaas();
  const [formState, setFormState] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Update formState when settings change
    setFormState({ ...settings });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await saveSettings(formState);
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Erro ao salvar configurações:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Configurações de Pagamento</h1>
        <p className="text-muted-foreground">Configure todas as opções de pagamento e integração com Asaas</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações Gerais</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              <span>Chaves de API</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Integração com Asaas
                </CardTitle>
                <CardDescription>
                  Configure sua integração com o gateway de pagamento Asaas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar Integração com Asaas</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative para habilitar o processamento de pagamentos através do Asaas
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
                    <Label className="text-base">Modo Sandbox</Label>
                    <p className="text-sm text-muted-foreground">
                      Use o sandbox do Asaas para testes (não processa pagamentos reais)
                    </p>
                  </div>
                  <Switch
                    checked={formState.sandboxMode}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, sandboxMode: checked }))}
                    disabled={loading || !formState.isEnabled}
                  />
                </div>
              </CardContent>
            </Card>
            
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
                          setFormState(prev => ({ ...prev, manualCardProcessing: checked }))
                        }
                        disabled={loading || !formState.isEnabled || !formState.allowCreditCard}
                      />
                    </div>
                    
                    {formState.manualCardProcessing && (
                      <Alert className="mt-2 bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
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
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Aviso</AlertTitle>
                    <AlertDescription>
                      Pelo menos um método de pagamento deve estar habilitado para que o checkout funcione.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
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
                    onChange={(e) => setFormState(prev => ({ ...prev, sandboxApiKey: e.target.value }))}
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
                    onChange={(e) => setFormState(prev => ({ ...prev, productionApiKey: e.target.value }))}
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
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700"
            disabled={loading || isSaving || (!formState.allowPix && !formState.allowCreditCard && formState.isEnabled)}
          >
            {isSaving ? (
              <>Salvando Configurações...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default PaymentSettings;
