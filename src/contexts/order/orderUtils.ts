
import { Order, CreateOrderInput, PaymentMethod } from '@/types/order';
import { v4 as uuidv4 } from 'uuid';

// Initial demo orders
export const initialOrders: Order[] = [
  {
    id: '1',
    customer: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01234-567'
      }
    },
    productId: '1',
    productName: 'Assinatura CineFlick Mensal',
    productPrice: 29.9,
    paymentMethod: 'pix',
    paymentStatus: 'confirmed',
    orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pixDetails: {
      qrCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
      qrCodeImage: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000'
    }
  },
  {
    id: '2',
    customer: {
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      cpf: '987.654.321-00',
      phone: '(11) 91234-5678'
    },
    productId: '2',
    productName: 'Curso de Fotografia Avançada',
    productPrice: 247.99,
    paymentMethod: 'card',
    paymentStatus: 'confirmed',
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    cardDetails: {
      number: '**** **** **** 4242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '***',
      brand: 'Visa'
    }
  },
  {
    id: '3',
    customer: {
      name: 'Carlos Pereira',
      email: 'carlos.pereira@example.com',
      cpf: '456.789.123-00',
      phone: '(21) 98765-4321'
    },
    productId: '1',
    productName: 'Assinatura CineFlick Mensal',
    productPrice: 29.9,
    paymentMethod: 'pix',
    paymentStatus: 'pending',
    orderDate: new Date().toISOString(),
    pixDetails: {
      qrCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
      qrCodeImage: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000',
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }
];

// Load orders from localStorage or use initial demo orders
export const loadOrders = (): Order[] => {
  const savedOrders = localStorage.getItem('orders');
  if (savedOrders) {
    return JSON.parse(savedOrders);
  }
  
  // Use initial demo orders if nothing in localStorage
  localStorage.setItem('orders', JSON.stringify(initialOrders));
  return initialOrders;
};

// Save orders to localStorage
export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

// Create a new order
export const createOrder = (orderData: CreateOrderInput): Order => {
  const newOrder: Order = {
    id: uuidv4(),
    ...orderData,
    orderDate: new Date().toISOString()
  };
  
  return newOrder;
};

// Filter orders by payment method
export const filterOrdersByPaymentMethod = (
  orders: Order[],
  method: PaymentMethod
): Order[] => {
  return orders.filter(order => order.paymentMethod === method);
};

// Update order status
export const updateOrderStatusData = (
  orders: Order[],
  id: string,
  status: Order['paymentStatus']
): { updatedOrder: Order; updatedOrders: Order[] } => {
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }
  
  const updatedOrder: Order = {
    ...orders[orderIndex],
    paymentStatus: status
  };
  
  const updatedOrders = [...orders];
  updatedOrders[orderIndex] = updatedOrder;
  
  return { updatedOrder, updatedOrders };
};
