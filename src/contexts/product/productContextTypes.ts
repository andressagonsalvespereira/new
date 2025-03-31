
import { ReactNode } from 'react';
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product';

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: CreateProductInput) => Promise<Product>;
  updateProduct: (product: UpdateProductInput) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProduct: (id: string) => Product | undefined;
}

export interface ProductProviderProps {
  children: ReactNode;
}
