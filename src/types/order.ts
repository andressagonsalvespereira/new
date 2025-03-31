
export type PaymentMethod = 'pix' | 'card';
export type PaymentStatus = 'pending' | 'confirmed' | 'declined' | 'refunded' | 'cancelled' | 'manual_review' | 'awaiting_manual_confirmation';

export interface CardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  brand?: string;
}

export interface PixDetails {
  qrCode: string;
  qrCodeImage?: string;
  expirationDate?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface Order {
  id: string;
  customerId?: string;
  customer: CustomerInfo;
  productId: string;
  productName: string;
  productPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  orderDate: string;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
}

export interface CreateOrderInput {
  customer: CustomerInfo;
  productId: string;
  productName: string;
  productPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
}
