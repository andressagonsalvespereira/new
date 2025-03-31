
import { processCardPayment } from './payment/cardProcessor';
import { processPixPayment } from './payment/pixProcessor';
import { PaymentProcessorProps } from './payment/types';

// Reexportar a função de processamento de cartão para manter compatibilidade
export { processCardPayment };

// Exportar types para manter compatibilidade
export type { PaymentProcessorProps };

// Exportar função de processamento PIX para uso futuro
export { processPixPayment };
