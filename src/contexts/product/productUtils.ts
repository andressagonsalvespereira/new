
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product';
import { ToastOptions } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Initial demo products
export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Assinatura CineFlick Mensal',
    price: 29.9,
    description: 'Assinatura mensal do serviço de streaming CineFlick com acesso a mais de 500 filmes.',
    imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=200&h=200',
    isDigital: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Curso de Fotografia Avançada',
    price: 247.99,
    description: 'Curso online completo de fotografia avançada com 60 horas de vídeo-aulas.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200&h=200',
    isDigital: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Load products from localStorage or use initial demo products
export const loadProducts = (): Product[] => {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    return JSON.parse(savedProducts);
  }
  
  // Use initial demo products if nothing in localStorage
  localStorage.setItem('products', JSON.stringify(initialProducts));
  return initialProducts;
};

// Save products to localStorage
export const saveProducts = (products: Product[]): void => {
  localStorage.setItem('products', JSON.stringify(products));
};

// Create a new product
export const createProduct = (productData: CreateProductInput): Product => {
  const newProduct: Product = {
    id: uuidv4(),
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newProduct;
};

// Update an existing product
export const updateProductData = (
  products: Product[], 
  productData: UpdateProductInput
): { updatedProduct: Product; updatedProducts: Product[] } => {
  const productIndex = products.findIndex(p => p.id === productData.id);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  const updatedProduct: Product = {
    ...products[productIndex],
    ...productData,
    updatedAt: new Date().toISOString()
  };
  
  const updatedProducts = [...products];
  updatedProducts[productIndex] = updatedProduct;
  
  return { updatedProduct, updatedProducts };
};

// Delete a product
export const deleteProductData = (
  products: Product[], 
  id: string
): Product[] => {
  return products.filter(product => product.id !== id);
};

// Find a product by ID
export const findProductById = (
  products: Product[], 
  id: string
): Product | undefined => {
  return products.find(product => product.id === id);
};
