
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
  const [formState, setFormState] = useState({
    isEnabled: false,
    manualCardProcessing: false,
    manualCardStatus: ManualCardStatus.ANALYSIS,
    manualCreditCard: false,
    allowPix: true,
    allowCreditCard: true,
    sandboxMode: true,
    sandboxApiKey: '',
    productionApiKey: '',
    manualPixPage: false,
    manualPaymentConfig: true,
  });

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
        manualCardProcessing: settings.manualCardProcessing || false,
        manualCardStatus: settings.manualCardStatus || ManualCardStatus.ANALYSIS,
        manualCreditCard: settings.manualCreditCard,
        allowPix: settings.allowPix,
        allowCreditCard: settings.allowCreditCard,
        sandboxMode: settings.sandboxMode,
        sandboxApiKey: settings.sandboxApiKey || '',
        productionApiKey: settings.productionApiKey || '',
        manualPixPage: settings.manualPixPage || false,
        manualPaymentConfig: settings.manualPaymentConfig || false,
      });
      
      // Update the local form state for card components
      setFormState({
        isEnabled: settings.isEnabled,
        manualCardProcessing: settings.manualCardProcessing || false,
        manualCardStatus: settings.manualCardStatus || ManualCardStatus.ANALYSIS,
        manualCreditCard: settings.manualCreditCard,
        allowPix: settings.allowPix,
        allowCreditCard: settings.allowCreditCard,
        sandboxMode: settings.sandboxMode,
        sandboxApiKey: settings.sandboxApiKey || '',
        productionApiKey: settings.productionApiKey || '',
        manualPixPage: settings.manualPixPage || false,
        manualPaymentConfig: settings.manualPaymentConfig || false,
      });
    }
  }, [settings, loading, form]);

  // Update formState when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormState(value as typeof formState);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof PaymentSettingsSchema>) => {
    setIsSaving(true);
    try {
      await updateSettings({
        isEnabled: data.isEnabled,
        manualCardProcessing: data.manualCardProcessing,
        manualCardStatus: data.manualCardStatus,
        manualCreditCard: data.manualCreditCard,
        allowPix: data.allowPix,
        allowCreditCard: data.allowCreditCard,
        sandboxMode: data.sandboxMode,
        sandboxApiKey: data.sandboxApiKey,
        productionApiKey: data.productionApiKey,
        manualPixPage: data.manualPixPage,
        manualPaymentConfig: data.manualPaymentConfig,
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
      <AsaasIntegrationCard 
        formState={formState} 
        loading={loading}
        onUpdateFormState={(updater) => {
          const newFormState = updater(formState);
          form.reset(newFormState);
        }}
      />
      
      <PaymentMethodsCard 
        formState={formState} 
        loading={loading}
        onUpdateFormState={(updater) => {
          const newFormState = updater(formState);
          form.reset(newFormState);
        }}
      />
      
      <ApiKeysCard 
        formState={formState}
        onUpdateFormState={(updater) => {
          const newFormState = updater(formState);
          form.reset(newFormState);
        }}
      />
      
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
