
import { ReactNode } from 'react';
import { Product, CreateProductInput } from '@/types/product';

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: CreateProductInput) => Promise<Product>;
  editProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Promise<Product | undefined>;
  refreshProducts: () => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export interface ProductProviderProps {
  children: ReactNode;
}
