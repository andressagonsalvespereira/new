
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAsaas } from '@/contexts/AsaasContext';
import AsaasIntegrationCard from './AsaasIntegrationCard';
import PaymentMethodsCard from './PaymentMethodsCard';
import ApiKeysCard from './ApiKeysCard';
import ManualPaymentSettings from './ManualPaymentSettings';
import { ManualCardStatus } from '@/components/checkout/utils/payment/card/manualCardProcessor';

const PaymentSettingsSchema = z.object({
  isEnabled: z.boolean(),
  manualCardProcessing: z.boolean(),
  manualCardStatus: z.enum(['APPROVED', 'DENIED', 'ANALYSIS']),
  manualCreditCard: z.boolean(),
  allowPix: z.boolean(),
  allowCreditCard: z.boolean(),
  sandboxMode: z.boolean(),
  sandboxApiKey: z.string().optional(),
  productionApiKey: z.string().optional(),
  manualPixPage: z.boolean(),
  manualPaymentConfig: z.boolean(),
});

const PaymentSettingsForm = () => {
  const { toast } = useToast();
  const { settings, updateSettings, loading } = useAsaas();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: {
      isEnabled: false,
      manualCardProcessing: false,
      manualCardStatus: ManualCardStatus.ANALYSIS as 'ANALYSIS' | 'APPROVED' | 'DENIED',
      manualCreditCard: false,
      allowPix: true,
      allowCreditCard: true,
      sandboxMode: true,
      sandboxApiKey: '',
      productionApiKey: '',
      manualPixPage: false,
      manualPaymentConfig: true,
    },
  });

  useEffect(() => {
    if (settings && !loading) {
      form.reset({
        isEnabled: settings.isEnabled,
        manualCardProcessing: settings.manualCardProcessing,
        manualCardStatus: settings.manualCardStatus || ManualCardStatus.ANALYSIS,
        manualCreditCard: settings.manualCreditCard,
        allowPix: settings.allowPix,
        allowCreditCard: settings.allowCreditCard,
        sandboxMode: settings.sandboxMode,
        sandboxApiKey: settings.sandboxApiKey,
        productionApiKey: settings.productionApiKey,
        manualPixPage: settings.manualPixPage,
        manualPaymentConfig: settings.manualPaymentConfig,
      });
    }
  }, [settings, loading, form]);

  const onSubmit = async (data: z.infer<typeof PaymentSettingsSchema>) => {
    setIsSaving(true);
    try {
      await updateSettings({
        ...data,
        apiKey: data.sandboxMode ? data.sandboxApiKey : data.productionApiKey,
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Carregando configurações...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <AsaasIntegrationCard form={form} />
      <PaymentMethodsCard form={form} />
      <ApiKeysCard form={form} />
      
      <ManualPaymentSettings form={form} />
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </form>
  );
};

export default PaymentSettingsForm;
