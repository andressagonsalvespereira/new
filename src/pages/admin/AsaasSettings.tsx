
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { 
  getAsaasConfig, 
  saveAsaasConfig, 
  getAsaasSettings,
  saveAsaasSettings
} from '@/services/asaasService';

const AsaasSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sandboxApiKey, setSandboxApiKey] = useState('');
  const [productionApiKey, setProductionApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [allowPix, setAllowPix] = useState(true);
  const [allowCreditCard, setAllowCreditCard] = useState(true);
  const [manualCreditCard, setManualCreditCard] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        // Obter as configurações do Asaas
        const settings = await getAsaasSettings();
        setIsEnabled(settings.isEnabled);
        setSandboxMode(settings.sandboxMode);
        setAllowPix(settings.allowPix);
        setAllowCreditCard(settings.allowCreditCard);
        setManualCreditCard(settings.manualCreditCard);

        // Obter as chaves de API
        const config = await getAsaasConfig();
        setSandboxApiKey(config.sandboxApiKey || '');
        setProductionApiKey(config.productionApiKey || '');
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações do Asaas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar as chaves de API
      await saveAsaasConfig({
        sandboxApiKey,
        productionApiKey
      });

      // Salvar as configurações
      await saveAsaasSettings({
        isEnabled,
        sandboxMode,
        allowPix,
        allowCreditCard,
        manualCreditCard
      });

      toast({
        title: "Sucesso",
        description: "Configurações do Asaas salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações do Asaas.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Configurações do Asaas</h1>
        <p className="text-muted-foreground">Gerencie suas chaves de API e preferências de pagamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Chaves de API Asaas</CardTitle>
            <CardDescription>
              Configure suas chaves de API para integração com o Asaas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sandboxApiKey">Chave de API Sandbox</Label>
              <Input
                id="sandboxApiKey"
                type="text"
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                placeholder="$aas_SANDBOX_..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usada para testes. Disponível no painel do Asaas em Ambientes de Teste.
              </p>
            </div>

            <div>
              <Label htmlFor="productionApiKey">Chave de API Produção</Label>
              <Input
                id="productionApiKey"
                type="text"
                value={productionApiKey}
                onChange={(e) => setProductionApiKey(e.target.value)}
                placeholder="$aas_PRODUCTION_..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usada para transações reais. Disponível no painel do Asaas em API.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <Switch 
                id="sandboxMode" 
                checked={sandboxMode} 
                onCheckedChange={setSandboxMode}
              />
              <Label htmlFor="sandboxMode">Usar ambiente Sandbox (testes)</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Preferências de Pagamento</CardTitle>
            <CardDescription>
              Configure como os pagamentos serão processados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isEnabled" 
                checked={isEnabled} 
                onCheckedChange={setIsEnabled}
              />
              <Label htmlFor="isEnabled">Habilitar integração com Asaas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="allowPix" 
                checked={allowPix} 
                onCheckedChange={setAllowPix}
              />
              <Label htmlFor="allowPix">Permitir pagamentos via PIX</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="allowCreditCard" 
                checked={allowCreditCard} 
                onCheckedChange={setAllowCreditCard}
              />
              <Label htmlFor="allowCreditCard">Permitir pagamentos via Cartão de Crédito</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="manualCreditCard" 
                checked={manualCreditCard} 
                onCheckedChange={setManualCreditCard}
              />
              <Label htmlFor="manualCreditCard">Processar cartões manualmente (sem Asaas)</Label>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600">
                Obs.: Se a integração com Asaas estiver desabilitada, os pagamentos serão processados manualmente, sem comunicação com a API do Asaas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AsaasSettings;
