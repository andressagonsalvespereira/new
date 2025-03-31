// Arquivo mantido para compatibilidade com versões anteriores
// Reexporta os processadores de pagamento do novo sistema

import { processCardPayment } from './payment/cardProcessor';
import { processPixPayment } from './payment/pixProcessor';
import { PaymentProcessorProps } from './payment/types';

// Reexportar a função de processamento de cartão para manter compatibilidade
export { processCardPayment };

// Exportar types para manter compatibilidade
export type { PaymentProcessorProps };

// Exportar função de processamento PIX para uso futuro
export { processPixPayment };

// Processa pagamento
export const processPayment = async (
  formValues: FormValues,
  paymentMethod: 'card' | 'pix',
  settings: AsaasSettings | null,
  isSandbox: boolean,
  onSubmit: (data: any) => void,
  setError: (error: string) => void,
  setPaymentStatus: (status: string | null) => void,
  setIsSubmitting: (isSubmitting: boolean) => void,
  navigate: ReturnType<typeof useNavigate>,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (!settings) {
    console.error("Settings not available");
    setError('Configurações de pagamento não disponíveis');
    return;
  }

  if (paymentMethod === 'card') {
    const formState = {
      personalInfo: formValues.personalInfo,
      productId: formValues.productId,
      productName: formValues.productName,
      productPrice: formValues.productPrice,
    };

    if (formValues.cardData) {
      const props: PaymentProcessorProps = {
        formState,
        settings,
        isSandbox,
        onSubmit,
      };

      await processCardPayment(
        formValues.cardData,
        props,
        setError,
        setPaymentStatus,
        setIsSubmitting,
        navigate,
        toast
      );
    } else {
      setError('Dados de cartão não fornecidos');
    }
  } else if (paymentMethod === 'pix') {
    await processPixPayment(
      formValues,
      settings,
      isSandbox,
      setError,
      setPaymentStatus,
      setIsSubmitting,
      navigate,
      toast,
      onSubmit
    );
  } else {
    setError('Método de pagamento não suportado');
  }
};
