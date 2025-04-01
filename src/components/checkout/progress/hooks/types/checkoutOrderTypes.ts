
import { ProductDetailsType } from '@/components/checkout/ProductDetails';

/**
 * Props for the useCheckoutContainerOrder hook
 */
export interface UseCheckoutContainerOrderProps {
  formState: {
    fullName: string;
    email: string;
    cpf: string;
    phone: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    selectedShipping: string | null;
    deliveryEstimate: string | null;
    formErrors: Record<string, string>;
  };
  productDetails: ProductDetailsType;
  handlePayment: (paymentData: any) => void;
}
