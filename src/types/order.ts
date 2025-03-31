
export type PaymentMethod = 'PIX' | 'CREDIT_CARD';
export type PaymentStatus = 'Aguardando' | 'Pago' | 'Cancelado' | 'Pendente';
export type DeviceType = 'mobile' | 'desktop';

export interface Order {
  id: string;
  customer: CustomerInfo;
  productId: string;
  productName: string;
  productPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
  timestamp?: string;
  orderDate?: string;
  paymentId?: string;
  createdAt?: string;
  updatedAt?: string;
  deviceType?: DeviceType;
  isDigitalProduct?: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address?: AddressInfo;
}

export interface AddressInfo {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface CardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  brand: string;
}

export interface PixDetails {
  qrCode?: string;
  qrCodeImage?: string;
  expirationDate?: string;
}

export interface CreateOrderInput {
  customer: CustomerInfo;
  productId: string;
  productName: string;
  productPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cardDetails?: CardDetails;
  pixDetails?: PixDetails;
  paymentId?: string;
  orderDate?: string;
  deviceType?: DeviceType;
  isDigitalProduct?: boolean;
}
