
import { Product, CreateProductInput } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

export const createProduct = (data: CreateProductInput): Product => {
  return {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isDigital: data.isDigital
  };
};

export const updateExistingProduct = (product: Product, data: CreateProductInput): Product => {
  return {
    ...product,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.imageUrl,
    isDigital: data.isDigital
  };
};
