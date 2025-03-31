
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Key, Save } from 'lucide-react';
import { useAsaas } from '@/contexts/AsaasContext';
import { useToast } from '@/hooks/use-toast';
import { AsaasSettings } from '@/types/asaas';
import AsaasIntegrationCard from './AsaasIntegrationCard';
import PaymentMethodsCard from './PaymentMethodsCard';
import ApiKeysCard from './ApiKeysCard';

const PaymentSettingsForm: React.FC = () => {
  const { settings, loading, saveSettings } = useAsaas();
  const [formState, setFormState] = useState<AsaasSettings>({ ...settings });
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

  const updateFormState = (updater: (prev: AsaasSettings) => AsaasSettings) => {
    setFormState(prev => updater(prev));
  };

  const isFormValid = formState.isEnabled ? (formState.allowPix || formState.allowCreditCard) : true;

  return (
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
          <AsaasIntegrationCard 
            formState={formState} 
            loading={loading} 
            onUpdateFormState={updateFormState} 
          />
          
          <PaymentMethodsCard 
            formState={formState} 
            loading={loading} 
            onUpdateFormState={updateFormState} 
          />
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <ApiKeysCard 
            formState={formState} 
            onUpdateFormState={updateFormState} 
          />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button 
          type="submit" 
          variant="default"
          disabled={loading || isSaving || !isFormValid}
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
  );
};

export default PaymentSettingsForm;
