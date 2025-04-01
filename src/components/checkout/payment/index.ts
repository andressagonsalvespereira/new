
// Export all payment processors and types
export * from './card/cardProcessor';
export * from './pix/pixProcessor';
export * from './shared/types';
export * from './shared/paymentSimulator';
export * from './card/utils/cardDetection';
export * from './card/utils/validators';

// Ensure the main types are accessible
import { PaymentProcessorProps, PaymentResult, CustomerData } from './shared/types';
export type { PaymentProcessorProps, PaymentResult, CustomerData };
