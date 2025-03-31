
import { Product, CreateProductInput } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

// Simulação de uma lista de produtos em memória
let productsInMemory: Product[] = [];

export const loadProducts = async (): Promise<Product[]> => {
  // Em um ambiente real, isso buscaria produtos do banco de dados
  return productsInMemory;
};

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

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  // Buscar o produto existente
  const existingProduct = productsInMemory.find(p => p.id === id);
  
  if (!existingProduct) {
    throw new Error(`Produto com ID ${id} não encontrado`);
  }
  
  // Atualizar o produto
  const updatedProduct = {
    ...existingProduct,
    ...data,
    // Garantir que campos numéricos sejam tratados corretamente
    price: data.price !== undefined ? data.price : existingProduct.price,
  };
  
  // Atualizar na lista em memória
  productsInMemory = productsInMemory.map(p => 
    p.id === id ? updatedProduct : p
  );
  
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  // Verificar se o produto existe
  const productExists = productsInMemory.some(p => p.id === id);
  
  if (!productExists) {
    throw new Error(`Produto com ID ${id} não encontrado`);
  }
  
  // Remover da lista em memória
  productsInMemory = productsInMemory.filter(p => p.id !== id);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  // Buscar produto por ID
  const product = productsInMemory.find(p => p.id === id);
  
  if (!product) {
    return undefined;
  }
  
  return product;
};
