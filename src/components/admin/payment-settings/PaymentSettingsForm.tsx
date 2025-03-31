
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import AsaasIntegrationCard from './AsaasIntegrationCard';
import PaymentMethodsCard from './PaymentMethodsCard';
import ApiKeysCard from './ApiKeysCard';
import ManualPaymentSettings from './ManualPaymentSettings';
import { usePaymentSettingsForm } from './hooks/usePaymentSettingsForm';

const PaymentSettingsForm = () => {
  const { form, formState, loading, isSaving, onSubmit, updateFormState } = usePaymentSettingsForm();

  if (loading) {
    return <div className="animate-pulse">Carregando configurações...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <ApiKeysCard 
          formState={formState}
          onUpdateFormState={updateFormState}
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
    </Form>
  );
};

export default PaymentSettingsForm;
